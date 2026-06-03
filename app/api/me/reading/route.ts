import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { getUserReadingStats } from "@/lib/data/reading-history";
import { formatDuration } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** GET /api/me/reading — total reading time + recent articles for logged-in user */
export async function GET() {
  try {
    const session = await requireUser();
    const userId = await resolveUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stats = await getUserReadingStats(userId);

    return NextResponse.json({
      ok: true,
      totalSeconds: stats.totalSeconds,
      totalFormatted: formatDuration(stats.totalSeconds),
      articlesRead: stats.articlesRead,
      recent: stats.recent.map((r) => ({
        ...r,
        formatted: formatDuration(r.secondsRead),
      })),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[me reading]", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}

