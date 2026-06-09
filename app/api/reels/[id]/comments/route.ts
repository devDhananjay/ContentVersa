import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { createReelComment, getReelComments } from "@/lib/reels/comments";

const PostSchema = z.object({
  content: z.string().trim().min(1).max(500),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ data: [] });
  }

  const reel = await prisma.reel.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!reel || reel.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Reel not found" }, { status: 404 });
  }

  const data = await getReelComments(id);
  return NextResponse.json({ data });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireUser();
    const userId = await requireUserId(session);
    const parsed = PostSchema.parse(await req.json());

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

    const comment = await createReelComment({
      reelId: id,
      userId,
      content: parsed.content,
    });

    return NextResponse.json({ ok: true, comment });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || "Invalid input" }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not post comment" }, { status: 500 });
  }
}
