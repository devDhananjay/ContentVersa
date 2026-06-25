import { NextResponse } from "next/server";
import { runDailyArticleGeneration } from "@/lib/seo/daily-articles";

function authorize(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const query = new URL(req.url).searchParams.get("secret");
  return bearer === secret || query === secret;
}

/** GET /api/cron/daily-articles — 1 AI article per category per IST day (default) */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const perCategory = Number(url.searchParams.get("perCategory") || "1");
  const maxTotal = url.searchParams.get("max")
    ? Number(url.searchParams.get("max"))
    : undefined;

  try {
    const result = await runDailyArticleGeneration({
      perCategory: Number.isFinite(perCategory) ? perCategory : 1,
      maxTotal,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron daily-articles]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cron failed" },
      { status: 500 }
    );
  }
}
