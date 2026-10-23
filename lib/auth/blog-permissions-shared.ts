/** Roles that always get AI blog writing without a DB grant. */
export const AI_DEFAULT_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

export type AiBlogPermissionStatus =
  | "NONE"
  | "REQUESTED"
  | "GRANTED"
  | "DENIED";

export function roleHasDefaultAiBlogAccess(role?: string | null): boolean {
  return (AI_DEFAULT_ROLES as readonly string[]).includes(role || "");
}

export function computeCanUseAiBlog(
  role: string | null | undefined,
  aiBlogPermission: AiBlogPermissionStatus | null | undefined
): boolean {
  if (roleHasDefaultAiBlogAccess(role)) return true;
  return aiBlogPermission === "GRANTED";
}

/** Actions that create substantial blog content via AI — require canUseAiBlog. */
export const AI_BLOG_WRITE_ACTIONS = new Set([
  "generate-from-title",
  "expand-thesis",
]);

export function isAiBlogWriteAction(action: string): boolean {
  return AI_BLOG_WRITE_ACTIONS.has(action);
}
