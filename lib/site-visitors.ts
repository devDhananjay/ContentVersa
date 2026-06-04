import { cache } from "react";
import { cookies } from "next/headers";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

const SITE_VISITOR_COOKIE = "cv_site";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function newSiteVisitorKey() {
  return `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export async function recordSiteVisit(input: {
  visitorKey: string;
  userId?: string | null;
}) {
  if (!isDatabaseConfigured()) return { uniqueVisitors: 0, isNew: false };

  const existing = await prisma.siteVisitor.findUnique({
    where: { visitorKey: input.visitorKey },
    select: { id: true },
  });

  if (!existing) {
    await prisma.siteVisitor.create({
      data: {
        visitorKey: input.visitorKey,
        userId: input.userId ?? null,
      },
    });
    const count = await prisma.siteVisitor.count();
    return { uniqueVisitors: count, isNew: true };
  }

  await prisma.siteVisitor.update({
    where: { visitorKey: input.visitorKey },
    data: {
      visits: { increment: 1 },
      ...(input.userId ? { userId: input.userId } : {}),
    },
  });

  const count = await prisma.siteVisitor.count();
  return { uniqueVisitors: count, isNew: false };
}

export async function getSiteVisitorCount(): Promise<number> {
  if (!isDatabaseConfigured()) return 0;
  try {
    return await prisma.siteVisitor.count();
  } catch {
    return 0;
  }
}

export const getSiteVisitorCountCached = cache(getSiteVisitorCount);

export async function ensureSiteVisitorCookie(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(SITE_VISITOR_COOKIE)?.value;
  if (existing) return existing;
  return newSiteVisitorKey();
}

export { SITE_VISITOR_COOKIE, COOKIE_MAX_AGE };
