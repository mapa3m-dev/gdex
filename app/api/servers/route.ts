import { NextRequest, NextResponse } from "next/server";
import { GD_SERVERS, GD_CLIENT_SECRET } from "@/lib/constants";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import type { ServerStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

async function checkServer(server: (typeof GD_SERVERS)[0]): Promise<ServerStatus> {
  const startTime = Date.now();

  try {
    if (server.type === "api") {
      const response = await fetch(`${server.url}128`, {
        method: "GET",
        signal: AbortSignal.timeout(8_000),
      });
      const latency = Date.now() - startTime;
      if (response.ok) {
        return { id: server.id, name: server.name, status: "online", latency };
      }
    } else {
      const formData = new URLSearchParams();
      formData.append("levelID", "128");
      formData.append("secret", GD_CLIENT_SECRET);
      formData.append("gameVersion", "22");
      formData.append("binaryVersion", "35");

      const response = await fetch(server.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "",
        },
        body: formData.toString(),
        signal: AbortSignal.timeout(8_000),
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const limit = checkRateLimit(request, "servers", { windowMs: 60_000, max: 12 });
  if (!limit.ok) return rateLimitResponse(limit);

  try {
    const results = await Promise.all(GD_SERVERS.map(checkServer));
    return NextResponse.json({
      success: true,
      servers: results,
      checkedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to check servers" },
      { status: 500 }
    );
  }
}
