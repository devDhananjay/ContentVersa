import { NextResponse } from "next/server";
import { publishAdsenseSafeDrafts } from "@/lib/blogs/publish-adsense-drafts";

function authorize(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const query = new URL(req.url).searchParams.get("secret");
  return bearer === secret || query === secret;
}

/**
 * GET /api/cron/publish-adsense-drafts
 * Drip-publishes AdSense-safe DRAFT blogs (default 2/run). No duplicates vs live.
 * Optional: ?limit=1|2|3 (max 5)
 */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const raw = Number(url.searchParams.get("limit") || "");
    const envLimit = Number(process.env.ADSENSE_DRAFT_PUBLISH_LIMIT || "2");
    const limit = Number.isFinite(raw) && raw > 0 ? raw : envLimit;

    const result = await publishAdsenseSafeDrafts(limit);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron publish-adsense-drafts]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cron failed" },
      { status: 500 }
    );
  }
}
