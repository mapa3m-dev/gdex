import { NextRequest, NextResponse } from "next/server";
import { GD_SERVERS } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface ServerStatus {
  id: string;
  name: string;
  status: "online" | "offline";
  latency: number;
}

async function checkServer(
  server: (typeof GD_SERVERS)[0]
): Promise<ServerStatus> {
  const startTime = Date.now();

  try {
    if (server.type === "api") {
      const response = await fetch(`${server.url}128`, {
        method: "GET",
        signal: AbortSignal.timeout(8000),
      });
      const latency = Date.now() - startTime;

      if (response.ok) {
        return { id: server.id, name: server.name, status: "online", latency };
      }
    } else {
      const formData = new URLSearchParams();
      formData.append("levelID", "128");
      formData.append("secret", "Wmfd2893gb7");
      formData.append("gameVersion", "22");
      formData.append("binaryVersion", "35");

      const response = await fetch(server.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "",
        },
        body: formData.toString(),
        signal: AbortSignal.timeout(8000),
      });

      const latency = Date.now() - startTime;
      const text = await response.text();

      if (text && !text.startsWith("-1") && text.length > 10) {
        return { id: server.id, name: server.name, status: "online", latency };
      }
    }
  } catch {
  }

  return {
    id: server.id,
    name: server.name,
    status: "offline",
    latency: Date.now() - startTime,
  };
}

export async function GET(_request: NextRequest) {
  try {
    const results = await Promise.all(GD_SERVERS.map(checkServer));

    return NextResponse.json({
      success: true,
      servers: results,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Server check error:", error);
    return NextResponse.json(
      { error: "Failed to check servers" },
      { status: 500 }
    );
  }
}
