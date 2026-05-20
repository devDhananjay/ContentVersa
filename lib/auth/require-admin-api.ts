import { requireUser, type SessionUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth/roles";

export async function requireAdminApi(): Promise<SessionUser> {
  const user = await requireUser();
  if (!isAdminRole(user.role)) throw new Error("FORBIDDEN");
  return user;
}

export async function requireSuperAdminApi(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("FORBIDDEN");
  return user;
}
