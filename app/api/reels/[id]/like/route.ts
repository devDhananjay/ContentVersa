import { NextResponse } from "next/server";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { requireUserId, resolveUserId } from "@/lib/auth/resolve-user-id";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getReelLikeState, toggleReelLike } from "@/lib/reels/likes";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ likesCount: 0, likedByMe: false });
  }

  const session = await getCurrentUser();
  const userId = session ? await resolveUserId(session) : null;
  const state = await getReelLikeState(id, userId);
  return NextResponse.json(state);
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireUser();
    const userId = await requireUserId(session);

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const reel = await prisma.reel.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!reel || reel.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    const result = await toggleReelLike(id, userId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in to like" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not update like" }, { status: 500 });
  }
}
