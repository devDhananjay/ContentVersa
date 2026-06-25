import { NextResponse } from "next/server";
import { ReportStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { getAdminReports, getAdminReportsCounts } from "@/lib/data/admin-reports";

/** GET /api/admin/reports?status=PENDING|DISMISSED|ACTION_TAKEN|ALL */
export async function GET(req: Request) {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status")?.toUpperCase();
    const status =
      statusParam === "ALL" || !statusParam
        ? "ALL"
        : (["PENDING", "DISMISSED", "ACTION_TAKEN"] as const).includes(
            statusParam as ReportStatus
          )
          ? (statusParam as ReportStatus)
          : "PENDING";

    const [reports, counts] = await Promise.all([
      getAdminReports(status),
      getAdminReportsCounts(),
    ]);

    return NextResponse.json({ ok: true, reports, counts });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[admin reports GET]", err);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}
