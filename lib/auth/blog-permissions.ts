import type { AiBlogPermission } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import {
  computeCanUseAiBlog,
  roleHasDefaultAiBlogAccess,
  type AiBlogPermissionStatus,
} from "@/lib/auth/blog-permissions-shared";

export {
  computeCanUseAiBlog,
  roleHasDefaultAiBlogAccess,
  isAiBlogWriteAction,
  AI_BLOG_WRITE_ACTIONS,
} from "@/lib/auth/blog-permissions-shared";

export type BlogPermissionSnapshot = {
  canWriteBlogs: boolean;
  aiBlogPermission: AiBlogPermission;
  /** Effective: role default OR GRANTED */
  canUseAiBlog: boolean;
};

export async function getBlogPermissionsForSession(
  session: SessionUser
): Promise<BlogPermissionSnapshot> {
  if (!isDatabaseConfigured()) {
    const canUseAiBlog = roleHasDefaultAiBlogAccess(session.role);
    return {
      canWriteBlogs: true,
      aiBlogPermission: (canUseAiBlog ? "GRANTED" : "NONE") as AiBlogPermission,
      canUseAiBlog,
    };
  }

  const userId = await resolveUserId(session);
  if (!userId) {
    return {
      canWriteBlogs: false,
      aiBlogPermission: "NONE" as AiBlogPermission,
      canUseAiBlog: roleHasDefaultAiBlogAccess(session.role),
    };
  }

  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      canWriteBlogs: true,
      aiBlogPermission: true,
    },
  });

  if (!row) {
    return {
      canWriteBlogs: false,
      aiBlogPermission: "NONE" as AiBlogPermission,
      canUseAiBlog: roleHasDefaultAiBlogAccess(session.role),
    };
  }

  return {
    canWriteBlogs: row.canWriteBlogs,
    aiBlogPermission: row.aiBlogPermission,
    canUseAiBlog: computeCanUseAiBlog(
      row.role,
      row.aiBlogPermission as AiBlogPermissionStatus
    ),
  };
}
