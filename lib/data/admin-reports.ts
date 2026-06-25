import type { ReportStatus, ReportTargetType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { REPORT_REASON_LABELS, REPORT_STATUS_LABELS } from "@/lib/reports/constants";

export type AdminReportRow = {
  id: string;
  reason: string;
  reasonCode: string;
  status: string;
  statusCode: ReportStatus;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string;
  inspectUrl: string;
  preview: string | null;
  details: string | null;
  actionNote: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  reporter: {
    id: string;
    username: string;
    name: string | null;
  };
};

async function resolveTarget(targetType: ReportTargetType, targetId: string) {
  switch (targetType) {
    case "BLOG": {
      const blog = await prisma.blog.findUnique({
        where: { id: targetId },
        select: { id: true, slug: true, title: true, excerpt: true },
      });
      if (!blog) {
        return {
          label: `blog: ${targetId}`,
          inspectUrl: "/admin/blogs",
          preview: null,
        };
      }
      return {
        label: `blog: ${blog.slug}`,
        inspectUrl: `/admin/blogs/${blog.id}`,
        preview: blog.title,
      };
    }
    case "USER": {
      const user = await prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true, username: true, name: true, email: true },
      });
      if (!user) {
        return {
          label: `user: ${targetId}`,
          inspectUrl: "/admin/users",
          preview: null,
        };
      }
      return {
        label: `user: ${user.username}`,
        inspectUrl: `/admin/users/${user.id}`,
        preview: user.name || user.email,
      };
    }
    case "COMMENT": {
      const comment = await prisma.comment.findUnique({
        where: { id: targetId },
        include: {
          blog: { select: { id: true, slug: true, title: true } },
          user: { select: { username: true } },
        },
      });
      if (!comment) {
        return {
          label: `comment: ${targetId}`,
          inspectUrl: "/admin/blogs",
          preview: null,
        };
      }
      return {
        label: `comment on ${comment.blog.slug}`,
        inspectUrl: `/admin/blogs/${comment.blog.id}`,
        preview: `@${comment.user.username}: ${comment.content.slice(0, 160)}`,
      };
    }
    case "REEL": {
      const reel = await prisma.reel.findUnique({
        where: { id: targetId },
        select: { id: true, caption: true },
      });
      if (!reel) {
        return {
          label: `reel: ${targetId}`,
          inspectUrl: "/admin/moderation",
          preview: null,
        };
      }
      return {
        label: `reel: ${reel.id.slice(0, 8)}`,
        inspectUrl: `/reels/${reel.id}`,
        preview: reel.caption.slice(0, 160),
      };
    }
    default: {
      const typeLabel = String(targetType);
      return {
        label: `${typeLabel.toLowerCase()}: ${targetId}`,
        inspectUrl: "/admin/reports",
        preview: null,
      };
    }
  }
}

export async function getAdminReports(status?: ReportStatus | "ALL"): Promise<AdminReportRow[]> {
  if (!isDatabaseConfigured()) return [];

  const where =
    status && status !== "ALL" ? { status } : undefined;

  const rows = await prisma.contentReport.findMany({
    where,
    include: {
      reporter: { select: { id: true, username: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const enriched = await Promise.all(
    rows.map(async (row) => {
      const target = await resolveTarget(row.targetType, row.targetId);
      return {
        id: row.id,
        reason: REPORT_REASON_LABELS[row.reason],
        reasonCode: row.reason,
        status: REPORT_STATUS_LABELS[row.status],
        statusCode: row.status,
        targetType: row.targetType,
        targetId: row.targetId,
        targetLabel: target.label,
        inspectUrl: target.inspectUrl,
        preview: target.preview,
        details: row.details,
        actionNote: row.actionNote,
        createdAt: row.createdAt,
        reviewedAt: row.reviewedAt,
        reporter: {
          id: row.reporter.id,
          username: row.reporter.username,
          name: row.reporter.name,
        },
      } satisfies AdminReportRow;
    })
  );

  return enriched;
}

export async function getAdminReportsCounts() {
  if (!isDatabaseConfigured()) {
    return { pending: 0, resolved: 0, total: 0 };
  }

  const [pending, resolved, total] = await Promise.all([
    prisma.contentReport.count({ where: { status: "PENDING" } }),
    prisma.contentReport.count({
      where: { status: { in: ["DISMISSED", "ACTION_TAKEN"] } },
    }),
    prisma.contentReport.count(),
  ]);

  return { pending, resolved, total };
}
