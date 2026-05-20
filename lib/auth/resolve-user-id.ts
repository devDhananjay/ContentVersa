import type { SessionUser } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

/** Resolve Prisma user id from JWT session (handles legacy `google:…` subs). */
export async function resolveUserId(session: SessionUser): Promise<string | null> {
  if (!session.sub || !isDatabaseConfigured()) return null;

  if (!session.sub.includes(":")) {
    const byId = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { id: true },
    });
    if (byId) return byId.id;
  }

  if (session.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: session.email },
      select: { id: true },
    });
    return byEmail?.id ?? null;
  }

  return null;
}

export async function requireUserId(session: SessionUser): Promise<string> {
  const id = await resolveUserId(session);
  if (!id) throw new Error("USER_NOT_FOUND");
  return id;
}
