import { NextResponse } from "next/server";
import type { ReelStatus } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import {
  REEL_MAX_CAPTION_CHARS,
  REEL_MIN_CAPTION_CHARS,
} from "@/lib/reels/constants";
import { getPublishedReels } from "@/lib/reels/data";
import { moderateReelContent } from "@/lib/reels/moderation";

const CreateSchema = z.object({
  caption: z
    .string()
    .trim()
    .min(REEL_MIN_CAPTION_CHARS, `Caption must be at least ${REEL_MIN_CAPTION_CHARS} characters`)
    .max(REEL_MAX_CAPTION_CHARS),
  mediaUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  durationSec: z.number().int().positive().optional(),
  cloudinaryId: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING"]).optional().default("PENDING"),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || 20);
  const cursor = searchParams.get("cursor") || undefined;
  const authorId = searchParams.get("authorId") || undefined;

  const { reels, nextCursor } = await getPublishedReels({ limit, cursor, authorId });
  return NextResponse.json({ reels, nextCursor });
}

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const authorId = await requireUserId(session);
    const parsed = CreateSchema.parse(await req.json());

    let categoryId: string | undefined;
    if (parsed.category) {
      const cat = await prisma.category.findUnique({
        where: { slug: parsed.category },
        select: { id: true },
      });
      categoryId = cat?.id;
    }

    let status: ReelStatus = parsed.status;
    let moderation: { held: boolean; reason?: string } | undefined;

    if (parsed.status === "DRAFT") {
      status = "DRAFT";
    } else {
      const mod = await moderateReelContent({
        caption: parsed.caption,
        mediaUrl: parsed.mediaUrl,
        thumbnailUrl: parsed.thumbnailUrl,
        mediaType: parsed.mediaType,
      });
      status = mod.safe ? "PUBLISHED" : "PENDING";
      if (!mod.safe) {
        moderation = { held: true, reason: mod.reason };
      }
    }

    const reel = await prisma.reel.create({
      data: {
        authorId,
        caption: parsed.caption,
        mediaUrl: parsed.mediaUrl,
        thumbnailUrl: parsed.thumbnailUrl,
        mediaType: parsed.mediaType,
        durationSec: parsed.durationSec,
        cloudinaryId: parsed.cloudinaryId,
        categoryId,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
      select: { id: true, status: true },
    });

    revalidatePath("/reels");
    revalidatePath("/dashboard/reels");

    return NextResponse.json({ ok: true, reel, moderation });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || "Invalid input" }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[reels POST]", err);
    return NextResponse.json({ error: "Could not create reel" }, { status: 500 });
  }
}
