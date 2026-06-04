import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/require-admin-api";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { isDatabaseConfigured } from "@/lib/prisma";
import { createUserNotification } from "@/lib/notifications/create";

/** Creates an in-app (+ push if configured) test notification for the signed-in user. */
export async function POST() {
  try {
    const session = await requireSuperAdminApi();
    const userId = await requireUserId(session);

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const row = await createUserNotification({
      userId,
      type: "SYSTEM",
      title: "Test notification",
      message:
        "If you see this in your list, in-app notifications are working. Browser push is separate.",
      link: "/dashboard/notifications",
    });

    return NextResponse.json({
      ok: true,
      id: row?.id,
      message: "Test notification created. Refresh the list or check the bell.",
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Super Admin only" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to send test" }, { status: 500 });
  }
}
