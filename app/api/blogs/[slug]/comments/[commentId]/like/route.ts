import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { toggleCommentLike } from "@/lib/data/comments";
import { isDatabaseConfigured } from "@/lib/prisma";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ slug: string; commentId: string }> }
) {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const { commentId } = await ctx.params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: true, liked: true, demo: true });
    }

    const result = await toggleCommentLike(commentId, userId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[comment like]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
