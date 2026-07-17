import type { SessionUser } from "@/lib/auth";
import { PLATFORM_OWNER_EMAIL } from "@/lib/owner";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

/** Authoritative role from DB — mirrors /api/auth/me (email first, then sub). */
export async function resolveSessionRole(
  session: Pick<SessionUser, "role" | "email" | "sub">
): Promise<SessionUser["role"]> {
  if (session.email?.toLowerCase() === PLATFORM_OWNER_EMAIL.toLowerCase()) {
    return "SUPER_ADMIN";
  }

  if (isDatabaseConfigured() && session.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: session.email },
      select: { role: true },
    });
    if (byEmail?.role) {
      return byEmail.role as SessionUser["role"];
    }
  }

  if (isDatabaseConfigured() && session.sub && !session.sub.includes(":")) {
    const byId = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { role: true },
    });
    if (byId?.role) {
      return byId.role as SessionUser["role"];
    }
  }

  return session.role ?? "USER";
}
