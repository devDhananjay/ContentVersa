import { NextResponse } from "next/server";
import { runToiNewsIngest } from "@/lib/seo/toi-news-ingest";

export const maxDuration = 300;

function authorize(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const query = new URL(req.url).searchParams.get("secret");
  return bearer === secret || query === secret;
}

/** GET /api/cron/toi-news — TOI RSS → rewrite → site blogs (prefer shell every 30m). */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const max = url.searchParams.get("max");
  const publishParam = url.searchParams.get("publish");
  const force = url.searchParams.get("force") === "1";
  const feeds = url.searchParams.get("feeds");

  try {
    const result = await runToiNewsIngest({
      maxPerRun: max ? Number(max) : undefined,
      force,
      publish:
        publishParam === "0"
          ? false
          : publishParam === "1"
            ? true
            : undefined,
      feedKeys: feeds
        ? feeds.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron toi-news]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cron failed" },
      { status: 500 }
    );
  }
}
