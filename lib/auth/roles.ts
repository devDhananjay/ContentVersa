import type { SessionUser } from "@/lib/auth";

export const ADMIN_ROLES = ["MODERATOR", "ADMIN", "SUPER_ADMIN"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role?: string | null): role is AdminRole {
  return ADMIN_ROLES.includes(role as AdminRole);
}

export function isAdminUser(user?: Pick<SessionUser, "role"> | null): boolean {
  return isAdminRole(user?.role);
}
