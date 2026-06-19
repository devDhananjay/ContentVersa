import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import {
  REEL_MAX_CAPTION_CHARS,
  REEL_MIN_CAPTION_CHARS,
} from "@/lib/reels/constants";
import { getUserReelById } from "@/lib/reels/data";
import { moderateReelContent } from "@/lib/reels/moderation";

const UpdateSchema = z.object({
  caption: z
    .string()
    .trim()
    .min(REEL_MIN_CAPTION_CHARS, `Caption must be at least ${REEL_MIN_CAPTION_CHARS} characters`)
    .max(REEL_MAX_CAPTION_CHARS),
  relatedBlogId: z.string().optional().nullable(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const authorId = await requireUserId(session);
    const { id } = await params;

    const reel = await getUserReelById(id, authorId);
    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    return NextResponse.json({ reel });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not load reel" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const authorId = await requireUserId(session);
    const { id } = await params;
    const parsed = UpdateSchema.parse(await req.json());

    const existing = await prisma.reel.findFirst({
      where: { id, authorId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    let status = existing.status;
    if (existing.status !== "DRAFT") {
      const mod = await moderateReelContent({
        caption: parsed.caption,
        mediaUrl: existing.mediaUrl,
        thumbnailUrl: existing.thumbnailUrl ?? undefined,
        mediaType: existing.mediaType,
      });
      status = mod.safe ? "PUBLISHED" : "PENDING";
    }

    let relatedBlogId: string | null | undefined = undefined;
    if (parsed.relatedBlogId !== undefined) {
      relatedBlogId = parsed.relatedBlogId;
      if (relatedBlogId) {
        const linked = await prisma.blog.findFirst({
          where: { id: relatedBlogId, status: "PUBLISHED" },
          select: { id: true },
        });
        if (!linked) relatedBlogId = null;
      }
    }

    const reel = await prisma.reel.update({
      where: { id },
      data: {
        caption: parsed.caption,
        status,
        publishedAt: status === "PUBLISHED" ? existing.publishedAt ?? new Date() : null,
        ...(relatedBlogId !== undefined ? { relatedBlogId } : {}),
      },
      select: { id: true, status: true },
    });

    revalidatePath("/dashboard/reels");
    revalidatePath("/reels");
    revalidatePath("/");
    revalidatePath("/admin/reels-moderation");

    return NextResponse.json({ ok: true, reel });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || "Invalid input" }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[reels mine PATCH]", err);
    return NextResponse.json({ error: "Could not update reel" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const authorId = await requireUserId(session);
    const { id } = await params;

    const existing = await prisma.reel.findFirst({
      where: { id, authorId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    await prisma.reel.delete({ where: { id } });

    revalidatePath("/dashboard/reels");
    revalidatePath("/reels");
    revalidatePath("/");
    revalidatePath("/admin/reels-moderation");

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[reels mine DELETE]", err);
    return NextResponse.json({ error: "Could not delete reel" }, { status: 500 });
  }
}
