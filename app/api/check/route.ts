import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const levelId = searchParams.get("id");

  if (!levelId || !/^\d+$/.test(levelId)) {
    return NextResponse.json(
      { error: "Invalid level ID" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://gdbrowser.com/api/level/${levelId}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        found: false,
        levelId,
        error: "Level not found",
      });
    }

    const data = await response.json();

    if (process.env.NODE_ENV === "development") {
      console.log("GDBrowser API response:", JSON.stringify(data, null, 2));
    }

    if (data.error || data === -1) {
      return NextResponse.json({
        found: false,
        levelId,
        error: "Level not found",
      });
    }

    return NextResponse.json({
      found: true,
      levelId,
      info: {
        id: data.id || levelId,
        name: data.name || "Unknown",
        author: data.author || data.creator || "Unknown",
        playerID: data.playerID,
        accountID: data.accountID,
        difficulty: data.difficulty || "N/A",
        stars: data.stars ?? data.orbs ?? 0,
        downloads: data.downloads ?? 0,
        likes: data.likes ?? data.rating ?? 0,
        length: data.length || "Unknown",
        song: data.songName || data.song,
        songID: data.songID,
        customSongID: data.customSong,
        songLink: data.songLink,
        coins: data.coins ?? data.userCoins ?? 0,
        verifiedCoins: data.verifiedCoins ?? false,
        featured: data.featured ?? false,
        epic: data.epic ?? false,
        gameVersion: data.gameVersion || "Unknown",
        objects: data.objects,
        description: data.description,
        uploadDate: data.uploaded,
        updateDate: data.updated,
        copiedID: data.copiedID,
        twoPlayer: data.twoPlayer,
        ldm: data.ldm,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Level check error:", error);
    }
    return NextResponse.json({
      found: false,
      levelId,
      error: "Failed to check level",
    });
  }
}
