import type { SessionUser } from "@/lib/auth";
import { prisma, isDatabaseConfigured, safeDbQuery } from "@/lib/prisma";

/** JWT `sub` when it is already a Prisma user id (not oauth `provider:id` or demo). */
function sessionSubAsUserId(sub: string): string | null {
  if (!sub || sub === "demo" || sub.includes(":")) return null;
  return sub;
}

/** Resolve Prisma user id from JWT session (handles legacy `google:…` subs). */
export async function resolveUserId(session: SessionUser): Promise<string | null> {
  if (!session.sub && !session.email) return null;
  if (!isDatabaseConfigured()) return sessionSubAsUserId(session.sub);

  const dbId = await safeDbQuery(null, async () => {
    // Email is authoritative — matches /api/auth/me role refresh when JWT sub is stale.
    if (session.email) {
      const byEmail = await prisma.user.findUnique({
        where: { email: session.email },
        select: { id: true },
      });
      if (byEmail) return byEmail.id;
    }

    if (session.sub && !session.sub.includes(":")) {
      const byId = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { id: true },
      });
      if (byId) return byId.id;
    }

    return null;
  }, "resolveUserId");

  return dbId ?? sessionSubAsUserId(session.sub);
}

export async function requireUserId(session: SessionUser): Promise<string> {
  const id = await resolveUserId(session);
  if (!id) throw new Error("USER_NOT_FOUND");
  return id;
}
