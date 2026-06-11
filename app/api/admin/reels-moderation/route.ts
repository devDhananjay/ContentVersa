import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getAdminReelModerationQueue } from "@/lib/data/admin-data";

const Schema = z.object({
  reelId: z.string(),
  decision: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().optional(),
});

export async function GET() {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    const queue = await getAdminReelModerationQueue();
    return NextResponse.json(queue);
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load queue" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    const { reelId, decision, feedback } = Schema.parse(await req.json());

    const reel = await prisma.reel.findUnique({
      where: { id: reelId },
      select: { id: true, caption: true, authorId: true, status: true },
    });

    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    if (decision === "APPROVED") {
      await prisma.$transaction([
        prisma.reel.update({
          where: { id: reelId },
          data: { status: "PUBLISHED", publishedAt: new Date() },
        }),
        prisma.notification.create({
          data: {
            userId: reel.authorId,
            type: "APPROVAL",
            title: "Reel approved",
            message: `Your reel is now live: “${reel.caption.slice(0, 80)}”`,
            link: `/reels/${reel.id}`,
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.reel.update({
          where: { id: reelId },
          data: { status: "REJECTED", publishedAt: null },
        }),
        prisma.notification.create({
          data: {
            userId: reel.authorId,
            type: "REJECTION",
            title: "Reel not approved",
            message:
              feedback ||
              `“${reel.caption.slice(0, 80)}” was rejected. Edit and resubmit from My Reels.`,
            link: "/dashboard/reels",
          },
        }),
      ]);
    }

    revalidatePath("/admin/reels-moderation");
    revalidatePath("/dashboard/reels");
    revalidatePath("/reels");
    revalidatePath("/");

    return NextResponse.json({ ok: true, reelId, decision });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[reels-moderation POST]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
