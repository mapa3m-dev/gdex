import type { ExportFormat } from "@/lib/constants";
import type { DownloadedFile, LevelInfo } from "@/lib/types";

export interface DownloadResponse {
  levelId: string;
  info?: LevelInfo;
  levelData?: string;
  parsed?: {
    header: Record<string, string>;
    object_count: number;
    objects_preview: Record<string, string | number>[];
  };
  stats?: Record<string, unknown>;
  songInfo?: { url?: string | null; name?: string } | null;
}

export function makeSafeName(name: string | undefined, levelId: string): string {
  return (name || `level_${levelId}`).replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
}

export function makeGmd(xmlData: string, lid: string, name: string): string {
  const escapedName = name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<?xml version="1.0"?>
<plist version="1.0" gjver="2.0">
<dict>
<key>LLM_01</key>
<dict>
<key>k_${lid}</key>
<dict>
<key>k2</key>
<string>${escapedName}</string>
<key>k4</key>
<string>${xmlData}</string>
</dict>
</dict>
<key>LLM_02</key>
<integer>26</integer>
</dict>
</plist>`;
}

export function objectsToCsv(objects: Record<string, string | number>[]): string {
  if (!objects.length) return "";

  const allKeys = new Set<string>();
  for (const obj of objects) {
    Object.keys(obj).forEach((k) => allKeys.add(k));
  }
  const keys = Array.from(allKeys);

  let csv = keys.join(",") + "\n";
  for (const obj of objects) {
    const row = keys.map((k) => {
      const val = obj[k];
      if (val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    csv += row.join(",") + "\n";
  }
  return csv;
}

export function objectsToTsv(objects: Record<string, string | number>[]): string {
  if (!objects.length) return "";

  const allKeys = new Set<string>();
  for (const obj of objects) {
    Object.keys(obj).forEach((k) => allKeys.add(k));
  }
  const keys = Array.from(allKeys);

  let tsv = keys.join("\t") + "\n";
  for (const obj of objects) {
    const row = keys.map((k) => {
      const val = obj[k];
      if (val === undefined) return "";
      return String(val).replace(/\t/g, " ");
    });
    tsv += row.join("\t") + "\n";
  }
  return tsv;
}

export async function generateFile(
  format: ExportFormat,
  data: DownloadResponse,
  safeName: string
): Promise<DownloadedFile | null> {
  let content: string | Blob;
  let filename: string;
  let mimeType: string;

  switch (format) {
    case "json":
      content = JSON.stringify(
        {
          level_id: parseInt(data.levelId, 10),
          metadata: data.info,
          header: data.parsed?.header,
          object_count: data.parsed?.object_count,
          objects_preview: data.parsed?.objects_preview,
          stats: data.stats,
        },
        null,
        2
      );
      filename = `${safeName}.json`;
      mimeType = "application/json";
      break;

    case "gmd":
      content = makeGmd(data.levelData || "", data.levelId, data.info?.name || `Level_${data.levelId}`);
      filename = `${safeName}.gmd`;
      mimeType = "application/xml";
      break;

    case "csv":
      content = objectsToCsv(data.parsed?.objects_preview || []);
      filename = `${safeName}_objects.csv`;
      mimeType = "text/csv";
      break;

    case "xls":
      content = objectsToTsv(data.parsed?.objects_preview || []);
      filename = `${safeName}_objects.xls`;
      mimeType = "application/vnd.ms-excel";
      break;

    case "meta":
      content = JSON.stringify(data.info, null, 2);
      filename = `${safeName}_meta.json`;
      mimeType = "application/json";
      break;

    case "mp3":
      if (data.songInfo?.url) {
        return {
          format: "mp3",
          filename: `${safeName}_song.mp3`,
          size: 0,
          url: data.songInfo.url,
        };
      }
      return null;

    default:
      return null;
  }

  const blob = typeof content === "string" ? new Blob([content], { type: mimeType }) : content;
  return { format, filename, size: blob.size, blob };
}

export function downloadFile(file: DownloadedFile): void {
  if (file.url) {
    window.open(file.url, "_blank");
    return;
  }
  if (file.blob) {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
