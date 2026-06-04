import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { isAdminUser } from "@/lib/auth/roles";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

/** Diagnostic payload for verifying notification delivery (in-app vs push). */
export async function GET() {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);

    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        database: false,
        inApp: { total: 0, unread: 0, lastAt: null },
        push: { tokens: 0, serverConfigured: false },
        admin: null,
      });
    }

    const [total, unread, last, pushTokens] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
      prisma.notification.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, type: true, title: true },
      }),
      prisma.pushToken.count({ where: { userId } }),
    ]);

    let admin: {
      last24hByType: Record<string, number>;
      totalLast24h: number;
    } | null = null;

    if (isAdminUser(session)) {
      const since = new Date(Date.now() - 86400000);
      const recent = await prisma.notification.groupBy({
        by: ["type"],
        where: { createdAt: { gte: since } },
        _count: { id: true },
      });
      admin = {
        last24hByType: Object.fromEntries(
          recent.map((r) => [r.type, r._count.id])
        ),
        totalLast24h: recent.reduce((s, r) => s + r._count.id, 0),
      };
    }

    return NextResponse.json({
      database: true,
      inApp: {
        total,
        unread,
        lastAt: last?.createdAt?.toISOString() ?? null,
        lastType: last?.type ?? null,
        lastTitle: last?.title ?? null,
      },
      push: {
        tokens: pushTokens,
        serverConfigured: Boolean(process.env.FIREBASE_ADMIN_CREDENTIALS),
        vapidConfigured: Boolean(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY),
      },
      admin,
      hints: [
        "In-app: Dashboard → Notifications (or bell). Approve a blog → author gets APPROVAL/BLOG_PUBLISHED.",
        "Cron (inactive/trending/weekly) only runs on server with CRON_SECRET — not on every page visit.",
        "Browser push needs permission + a saved push token; check tokens count above.",
      ],
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
