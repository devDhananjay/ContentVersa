import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { getUserReels, getUserReelStats } from "@/lib/reels/data";

export async function GET() {
  try {
    const session = await requireUser();
    const authorId = await requireUserId(session);

    const [reels, stats] = await Promise.all([
      getUserReels(authorId),
      getUserReelStats(authorId),
    ]);

    return NextResponse.json({ reels, stats });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not load reels" }, { status: 500 });
  }
}
