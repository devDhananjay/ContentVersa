import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { isDatabaseConfigured } from "@/lib/prisma";
import { getUserBookmarkedRefs } from "@/lib/data/blog-engagement";

export const dynamic = "force-dynamic";

/** GET /api/me/bookmarks — one response for all saved article refs (stops N× /bookmark calls). */
export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ slugs: [], ids: [] });
  }

  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ slugs: [], ids: [] });
    }
    const userId = await resolveUserId(session);
    if (!userId) {
      return NextResponse.json({ slugs: [], ids: [] });
    }

    const refs = await getUserBookmarkedRefs(userId);
    return NextResponse.json(refs);
  } catch (err) {
    console.error("[me bookmarks]", err);
    return NextResponse.json({ slugs: [], ids: [] });
  }
}
