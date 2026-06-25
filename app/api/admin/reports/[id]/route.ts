import { NextResponse } from "next/server";
import { z } from "zod";
import { BlogStatus, ReelStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

const ActionSchema = z.object({
  action: z.enum([
    "DISMISS",
    "HIDE_COMMENT",
    "ARCHIVE_BLOG",
    "BAN_USER",
    "WARN_USER",
    "REJECT_REEL",
  ]),
  note: z.string().max(2000).optional(),
});

/** PATCH /api/admin/reports/[id] — dismiss or take moderation action */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const reviewer = await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const reviewerId = await requireUserId(reviewer);
    const { id } = await ctx.params;
    const { action, note } = ActionSchema.parse(await req.json());

    const report = await prisma.contentReport.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        targetType: true,
        targetId: true,
        reason: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.status !== "PENDING" && action !== "DISMISS") {
      return NextResponse.json({ error: "Report already resolved" }, { status: 400 });
    }

    const actionNote = note?.trim() || null;

    if (action === "DISMISS") {
      await prisma.contentReport.update({
        where: { id },
        data: {
          status: "DISMISSED",
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          actionNote: actionNote || "Dismissed — no violation found",
        },
      });
    } else {
      switch (report.targetType) {
        case "COMMENT": {
          if (action !== "HIDE_COMMENT") {
            return NextResponse.json({ error: "Invalid action for comment report" }, { status: 400 });
          }
          await prisma.$transaction([
            prisma.comment.update({
              where: { id: report.targetId },
              data: { isHidden: true },
            }),
            prisma.contentReport.update({
              where: { id },
              data: {
                status: "ACTION_TAKEN",
                reviewedById: reviewerId,
                reviewedAt: new Date(),
                actionNote: actionNote || "Comment hidden",
              },
            }),
          ]);
          break;
        }
        case "BLOG": {
          if (action !== "ARCHIVE_BLOG") {
            return NextResponse.json({ error: "Invalid action for blog report" }, { status: 400 });
          }
          const blog = await prisma.blog.findUnique({
            where: { id: report.targetId },
            select: { slug: true, authorId: true, title: true },
          });
          if (!blog) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 });
          }
          await prisma.$transaction([
            prisma.blog.update({
              where: { id: report.targetId },
              data: { status: BlogStatus.ARCHIVED },
            }),
            prisma.contentReport.update({
              where: { id },
              data: {
                status: "ACTION_TAKEN",
                reviewedById: reviewerId,
                reviewedAt: new Date(),
                actionNote: actionNote || "Blog archived",
              },
            }),
            prisma.notification.create({
              data: {
                userId: blog.authorId,
                type: "SYSTEM",
                title: "Content removed",
                message: `Your article “${blog.title}” was archived after a community report.`,
                link: "/dashboard/blogs",
              },
            }),
          ]);
          revalidatePath(`/blog/${blog.slug}`);
          revalidatePath("/blogs");
          break;
        }
        case "USER": {
          if (action === "BAN_USER") {
            await prisma.$transaction([
              prisma.user.update({
                where: { id: report.targetId },
                data: {
                  banned: true,
                  banReason: actionNote || `Report: ${report.reason}`,
                },
              }),
              prisma.contentReport.update({
                where: { id },
                data: {
                  status: "ACTION_TAKEN",
                  reviewedById: reviewerId,
                  reviewedAt: new Date(),
                  actionNote: actionNote || "User banned",
                },
              }),
            ]);
          } else if (action === "WARN_USER") {
            await prisma.$transaction([
              prisma.user.update({
                where: { id: report.targetId },
                data: { warnings: { increment: 1 } },
              }),
              prisma.contentReport.update({
                where: { id },
                data: {
                  status: "ACTION_TAKEN",
                  reviewedById: reviewerId,
                  reviewedAt: new Date(),
                  actionNote: actionNote || "Warning issued",
                },
              }),
              prisma.notification.create({
                data: {
                  userId: report.targetId,
                  type: "SYSTEM",
                  title: "Community guidelines warning",
                  message:
                    actionNote ||
                    "A report was reviewed. Please follow our community guidelines.",
                  link: "/policy",
                },
              }),
            ]);
          } else {
            return NextResponse.json({ error: "Invalid action for user report" }, { status: 400 });
          }
          revalidatePath(`/admin/users/${report.targetId}`);
          break;
        }
        case "REEL": {
          if (action !== "REJECT_REEL") {
            return NextResponse.json({ error: "Invalid action for reel report" }, { status: 400 });
          }
          const reel = await prisma.reel.findUnique({
            where: { id: report.targetId },
            select: { authorId: true, caption: true },
          });
          if (!reel) {
            return NextResponse.json({ error: "Reel not found" }, { status: 404 });
          }
          await prisma.$transaction([
            prisma.reel.update({
              where: { id: report.targetId },
              data: { status: ReelStatus.REJECTED, publishedAt: null },
            }),
            prisma.contentReport.update({
              where: { id },
              data: {
                status: "ACTION_TAKEN",
                reviewedById: reviewerId,
                reviewedAt: new Date(),
                actionNote: actionNote || "Reel rejected",
              },
            }),
            prisma.notification.create({
              data: {
                userId: reel.authorId,
                type: "REJECTION",
                title: "Reel removed",
                message:
                  actionNote ||
                  `Your reel was removed after review: “${reel.caption.slice(0, 80)}”`,
                link: "/dashboard/reels",
              },
            }),
          ]);
          revalidatePath(`/reels/${report.targetId}`);
          break;
        }
        default:
          return NextResponse.json({ error: "Unsupported target type" }, { status: 400 });
      }
    }

    revalidatePath("/admin/reports");
    revalidatePath("/admin/blogs");
    revalidatePath("/");

    return NextResponse.json({ ok: true, reportId: id, action });
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
    console.error("[admin reports PATCH]", err);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
