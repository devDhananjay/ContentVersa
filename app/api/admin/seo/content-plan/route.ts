import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { P2_CONTENT_TOPICS } from "@/lib/seo/p2-content-plan";

/** Curated P2 topic list for admin pipeline — drafts only, not auto-publish. */
export async function GET() {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    return NextResponse.json({
      topics: P2_CONTENT_TOPICS,
      count: P2_CONTENT_TOPICS.length,
      note: "Promote topics with GSC impressions first. Max ~2 AI drafts/week from this list.",
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
