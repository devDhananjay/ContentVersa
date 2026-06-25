import { NextResponse } from "next/server";
import { z } from "zod";
import { ReportReason, ReportTargetType } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

const SubmitSchema = z.object({
  targetType: z.enum(["BLOG", "COMMENT", "USER", "REEL"]),
  targetId: z.string().min(1),
  reason: z.enum([
    "SPAM",
    "HARASSMENT",
    "HATE_SPEECH",
    "MISINFORMATION",
    "INAPPROPRIATE",
    "OTHER",
  ]),
  details: z.string().max(2000).optional(),
});

async function targetExists(targetType: ReportTargetType, targetId: string): Promise<boolean> {
  switch (targetType) {
    case "BLOG":
      return Boolean(await prisma.blog.findUnique({ where: { id: targetId }, select: { id: true } }));
    case "COMMENT":
      return Boolean(
        await prisma.comment.findUnique({ where: { id: targetId }, select: { id: true } })
      );
    case "USER":
      return Boolean(await prisma.user.findUnique({ where: { id: targetId }, select: { id: true } }));
    case "REEL":
      return Boolean(await prisma.reel.findUnique({ where: { id: targetId }, select: { id: true } }));
    default:
      return false;
  }
}

/** POST /api/reports — submit a content report (signed-in users) */
export async function POST(req: Request) {
  try {
    const session = await requireUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const reporterId = await requireUserId(session);
    const body = SubmitSchema.parse(await req.json());

    if (body.targetType === "USER" && body.targetId === reporterId) {
      return NextResponse.json({ error: "You cannot report yourself" }, { status: 400 });
    }

    const exists = await targetExists(body.targetType as ReportTargetType, body.targetId);
    if (!exists) {
      return NextResponse.json({ error: "Reported content not found" }, { status: 404 });
    }

    const report = await prisma.contentReport.upsert({
      where: {
        reporterId_targetType_targetId: {
          reporterId,
          targetType: body.targetType as ReportTargetType,
          targetId: body.targetId,
        },
      },
      create: {
        reporterId,
        targetType: body.targetType as ReportTargetType,
        targetId: body.targetId,
        reason: body.reason as ReportReason,
        details: body.details?.trim() || null,
      },
      update: {
        reason: body.reason as ReportReason,
        details: body.details?.trim() || null,
        status: "PENDING",
        reviewedById: null,
        reviewedAt: null,
        actionNote: null,
      },
      select: { id: true, status: true },
    });

    return NextResponse.json({ ok: true, report });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[reports POST]", err);
    return NextResponse.json({ error: "Could not submit report" }, { status: 500 });
  }
}
