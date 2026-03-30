import { NextRequest, NextResponse } from "next/server";
import { GD_SERVERS, OBJ_KEYS, HEADER_KEYS } from "@/lib/constants";
import zlib from "zlib";

function decodeLevelData(raw: string): string {
  let s = raw.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  s += "=".repeat((4 - (s.length % 4)) % 4);

  const buffer = Buffer.from(s, "base64");

  for (const windowBits of [47, 15, -15, 31]) {
    try {
      const decompressed = zlib.inflateSync(buffer, { windowBits });
      return decompressed.toString("utf-8");
    } catch {
      continue;
    }
  }

  return buffer.toString("utf-8");
}

function parseKV(raw: string, separator: string = ":"): Record<string, string> {
  const parts = raw.split(separator);
  const result: Record<string, string> = {};
  for (let i = 0; i < parts.length - 1; i += 2) {
    result[parts[i]] = parts[i + 1];
  }
  return result;
}

function parseSongKV(raw: string): Record<string, string> {
  const parts = raw.split("~|~");
  const result: Record<string, string> = {};
  for (let i = 0; i < parts.length - 1; i += 2) {
    result[parts[i]] = parts[i + 1];
  }
  return result;
}

function parseObjects(levelData: string) {
  const parts = levelData.split(";");

  const header: Record<string, string> = {};
  if (parts.length > 0) {
    const hp = parts[0].split(",");
    for (let i = 0; i < hp.length - 1; i += 2) {
      const key = HEADER_KEYS[hp[i]] || hp[i];
      header[key] = hp[i + 1];
    }
  }

  const objects: Record<string, string | number>[] = [];
  for (let i = 1; i < parts.length; i++) {
    const objStr = parts[i].trim();
    if (!objStr) continue;

    const op = objStr.split(",");
    const obj: Record<string, string | number> = {};

    for (let j = 0; j < op.length - 1; j += 2) {
      const key = OBJ_KEYS[op[j]] || `p${op[j]}`;
      let val: string | number = op[j + 1];

      if (val.includes(".")) {
        const floatVal = parseFloat(val);
        if (!isNaN(floatVal)) val = floatVal;
      } else {
        const intVal = parseInt(val, 10);
        if (!isNaN(intVal)) val = intVal;
      }

      obj[key] = val;
    }

    if (Object.keys(obj).length > 0) {
      objects.push(obj);
    }
  }

  objects.sort((a, b) => {
    const ax = typeof a.x === "number" ? a.x : 0;
    const bx = typeof b.x === "number" ? b.x : 0;
    return ax - bx;
  });

  return { header, objects, object_count: objects.length };
}

function computeStats(objects: Record<string, string | number>[]) {
  if (!objects.length) {
    return {
      total: 0, unique_types: 0,
      x_min: 0, x_max: 0, y_min: 0, y_max: 0,
      width: 0, height: 0, top_objects: [],
      with_rotation: 0, with_scale: 0, with_groups: 0,
    };
  }

  const xs = objects.map((o) => o.x).filter((x): x is number => typeof x === "number");
  const ys = objects.map((o) => o.y).filter((y): y is number => typeof y === "number");
  const ids = objects.map((o) => o.obj_id).filter((id): id is number => typeof id === "number");

  const freq: Record<number, number> = {};
  for (const id of ids) {
    freq[id] = (freq[id] || 0) + 1;
  }

  const xMin = xs.length ? Math.min(...xs) : 0;
  const xMax = xs.length ? Math.max(...xs) : 0;
  const yMin = ys.length ? Math.min(...ys) : 0;
  const yMax = ys.length ? Math.max(...ys) : 0;

  return {
    total: objects.length,
    unique_types: new Set(ids).size,
    x_min: xMin, x_max: xMax,
    y_min: yMin, y_max: yMax,
    width: xMax - xMin,
    height: yMax - yMin,
    top_objects: Object.entries(freq)
      .map(([id, count]) => [parseInt(id, 10), count] as [number, number])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25),
    with_rotation: objects.filter((o) => (typeof o.rotation === "number" && o.rotation !== 0)).length,
    with_scale: objects.filter((o) => "scale" in o).length,
    with_groups: objects.filter((o) => "groups" in o).length,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { levelId, serverId } = await request.json();

    if (!levelId || !/^\d+$/.test(String(levelId))) {
      return NextResponse.json({ error: "Invalid level ID" }, { status: 400 });
    }

    let levelInfo = null;
    try {
      const metaResponse = await fetch(
        `https://gdbrowser.com/api/level/${levelId}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (metaResponse.ok) {
        const data = await metaResponse.json();
        if (!data.error) {
          levelInfo = data;
        }
      }
    } catch {
    }

    const server = serverId
      ? GD_SERVERS.find((s) => s.id === serverId)
      : GD_SERVERS.find((s) => s.type !== "api") || GD_SERVERS[1];

    if (!server || server.type === "api") {
      const fallbackServer = GD_SERVERS.find((s) => s.type === "official") || GD_SERVERS[1];
      if (!fallbackServer) {
        return NextResponse.json({ error: "No download server available" }, { status: 503 });
      }
    }

    let rawResponse = "";
    let usedServer = "";

    for (const srv of GD_SERVERS.filter((s) => s.type !== "api")) {
      try {
        const formData = new URLSearchParams();
        formData.append("levelID", String(levelId));
        formData.append("secret", process.env.GD_SECRET!);
        formData.append("gameVersion", "22");
        formData.append("binaryVersion", "35");
        formData.append("gdw", "0");

        const response = await fetch(srv.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "",
          },
          body: formData.toString(),
          signal: AbortSignal.timeout(15000),
        });

        const text = await response.text();

        if (text && !text.startsWith("-1") && text.length > 10) {
          rawResponse = text;
          usedServer = srv.name;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!rawResponse) {
      return NextResponse.json(
        { error: "Level data not available. Try VPN or another server." },
        { status: 404 }
      );
    }

    const parts = rawResponse.split("#");
    const mainPart = parts[0];
    const kv = parseKV(mainPart);
    const levelString = kv["4"];

    if (!levelString) {
      return NextResponse.json(
        { error: "Level string is empty" },
        { status: 502 }
      );
    }

    const decodedData = decodeLevelData(levelString);
    const parsed = parseObjects(decodedData);
    const stats = computeStats(parsed.objects);

    let songInfo = null;
    for (const part of parts) {
      if (part.includes("~|~")) {
        songInfo = parseSongKV(part);
        break;
      }
    }

    const responseData = {
      success: true,
      levelId,
      server: usedServer,
      info: levelInfo || {
        id: levelId,
        name: kv["2"] || `Level_${levelId}`,
        author: "Unknown",
      },
      levelData: decodedData,
      parsed: {
        header: parsed.header,
        object_count: parsed.object_count,
        objects_preview: parsed.objects.slice(0, 100),
      },
      stats,
      songInfo: songInfo
        ? {
            id: songInfo["1"],
            name: songInfo["2"],
            artistID: songInfo["3"],
            artistName: songInfo["4"],
            size: songInfo["5"],
            url: songInfo["10"] ? decodeURIComponent(songInfo["10"]) : null,
          }
        : null,
      rawSize: rawResponse.length,
      decodedSize: decodedData.length,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
