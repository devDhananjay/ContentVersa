import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

const PatchSchema = z.object({
  all: z.boolean().optional(),
  id: z.string().optional(),
});

function timeAgoShort(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const NOTIF_ICON: Record<string, string> = {
  APPROVAL: "approval",
  REJECTION: "rejection",
  COMMENT: "comment",
  REPLY: "comment",
  LIKE: "like",
  FOLLOW: "follow",
  MENTION: "system",
  SYSTEM: "system",
  TIP_RECEIVED: "like",
  PAYOUT: "achievement",
  BLOG_PUBLISHED: "approval",
  RELATED_BLOG: "system",
  INACTIVE_REMINDER: "system",
  TRENDING: "like",
  WEEKLY_DIGEST: "system",
  CATEGORY_NEW: "system",
};

export async function GET() {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ data: [], unread: 0 });
    }

    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unread = rows.filter((n) => !n.read).length;

    return NextResponse.json({
      data: rows.map((n) => ({
        id: n.id,
        icon: NOTIF_ICON[n.type] ?? "system",
        title: n.title,
        body: n.message,
        time: timeAgoShort(n.createdAt),
        unread: !n.read,
        link: n.link,
      })),
      unread,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const body = PatchSchema.parse(await req.json());

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: true, demo: true });
    }

    if (body.all) {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    } else if (body.id) {
      await prisma.notification.updateMany({
        where: { userId, id: body.id },
        data: { read: true },
      });
    } else {
      return NextResponse.json({ error: "Provide id or all:true" }, { status: 400 });
    }

    const unread = await prisma.notification.count({
      where: { userId, read: false },
    });

    return NextResponse.json({ ok: true, unread });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
