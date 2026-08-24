import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ sessions: [] });
  }

  const session = await getCurrentUser();
  if (!session || !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(session.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const visits = await prisma.userPageVisit.findMany({
    where: { userId: id },
    orderBy: { visitedAt: "desc" },
    take: 500,
  });

  type Visit = (typeof visits)[number];
  const sessionMap = new Map<string, Visit[]>();
  for (const v of visits) {
    const arr = sessionMap.get(v.sessionId) || [];
    arr.push(v);
    sessionMap.set(v.sessionId, arr);
  }

  const sessions = [...sessionMap.entries()].map(([sessionId, pages]) => {
    const sorted = pages.sort((a: Visit, b: Visit) => a.visitedAt.getTime() - b.visitedAt.getTime());
    return {
      sessionId,
      startedAt: sorted[0].visitedAt.toISOString(),
      pageCount: sorted.length,
      totalDuration: sorted.reduce((s: number, p: Visit) => s + p.duration, 0),
      dropOffPage: sorted[sorted.length - 1].path,
      pages: sorted.map((p: Visit) => ({
        path: p.path,
        duration: p.duration,
        visitedAt: p.visitedAt.toISOString(),
      })),
    };
  });

  return NextResponse.json({ sessions });
}
