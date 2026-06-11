import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { getViewedReelIds } from "@/lib/reels/data";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams
      .get("ids")
      ?.split(",")
      .map((id) => id.trim())
      .filter(Boolean) ?? [];
    const visitorKey = searchParams.get("visitorKey")?.trim() || undefined;

    const session = await getCurrentUser();
    const userId = session ? await resolveUserId(session) : null;

    if (!userId && !visitorKey) {
      return NextResponse.json({ viewedIds: [] });
    }

    const viewedIds = await getViewedReelIds(ids, {
      userId: userId ?? undefined,
      visitorKey,
    });

    return NextResponse.json({ viewedIds });
  } catch (err) {
    console.error("[reels viewed GET]", err);
    return NextResponse.json({ viewedIds: [] });
  }
}
