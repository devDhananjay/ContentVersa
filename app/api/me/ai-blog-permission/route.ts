import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  getBlogPermissionsForSession,
  roleHasDefaultAiBlogAccess,
} from "@/lib/auth/blog-permissions";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/** GET — current AI blog permission status */
export async function GET() {
  try {
    const session = await requireUser();
    const perms = await getBlogPermissionsForSession(session);
    return NextResponse.json({
      canWriteBlogs: perms.canWriteBlogs,
      aiBlogPermission: perms.aiBlogPermission,
      canUseAiBlog: perms.canUseAiBlog,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

/** POST — request AI blog writing permission */
export async function POST() {
  try {
    const session = await requireUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    if (roleHasDefaultAiBlogAccess(session.role)) {
      return NextResponse.json({
        ok: true,
        aiBlogPermission: "GRANTED",
        canUseAiBlog: true,
        message: "Admins already have AI blog access.",
      });
    }

    const userId = await requireUserId(session);
    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { aiBlogPermission: true, role: true },
    });
    if (!current) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (current.aiBlogPermission === "GRANTED" || roleHasDefaultAiBlogAccess(current.role)) {
      return NextResponse.json({
        ok: true,
        aiBlogPermission: "GRANTED",
        canUseAiBlog: true,
        message: "You already have AI blog access.",
      });
    }

    if (current.aiBlogPermission === "REQUESTED") {
      return NextResponse.json({
        ok: true,
        aiBlogPermission: "REQUESTED",
        canUseAiBlog: false,
        message: "Your request is already pending admin review.",
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { aiBlogPermission: "REQUESTED" },
      select: { aiBlogPermission: true },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);

    return NextResponse.json({
      ok: true,
      aiBlogPermission: updated.aiBlogPermission,
      canUseAiBlog: false,
      message: "Request sent. An admin will review AI blog access for your account.",
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[me ai-blog-permission POST]", err);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}
