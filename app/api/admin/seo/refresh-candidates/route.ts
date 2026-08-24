import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getSeoRefreshCandidates } from "@/lib/seo/refresh-candidates";

/** Published blogs ranked for SEO refresh (on-site signals). Merge with GSC CTR manually. */
export async function GET(req: Request) {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    const limit = Number(new URL(req.url).searchParams.get("limit") || "25");
    const candidates = await getSeoRefreshCandidates(
      Number.isFinite(limit) ? Math.min(limit, 50) : 25
    );
    return NextResponse.json({
      candidates,
      count: candidates.length,
      note: "Edit in admin, expand thin posts, or add meta — do not mass-regenerate AI.",
    });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
