import { NextResponse } from "next/server";
import { publishDueScheduledBlogs } from "@/lib/blogs/publish-scheduled";

function authorize(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const query = new URL(req.url).searchParams.get("secret");
  return bearer === secret || query === secret;
}

/** GET /api/cron/publish-scheduled — publish blogs whose schedule time has passed */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await publishDueScheduledBlogs();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron publish-scheduled]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cron failed" },
      { status: 500 }
    );
  }
}
