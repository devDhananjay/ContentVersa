import { NextResponse } from "next/server";
import {
  sendInactiveReaderReminders,
  sendTrendingArticleAlert,
  sendWeeklyDigest,
} from "@/lib/notifications/cron";

const JOBS = ["inactive", "trending", "weekly"] as const;

function authorize(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const query = new URL(req.url).searchParams.get("secret");
  return bearer === secret || query === secret;
}

export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const job = new URL(req.url).searchParams.get("job");
  if (!job || !JOBS.includes(job as (typeof JOBS)[number])) {
    return NextResponse.json(
      { error: "Invalid job. Use ?job=inactive|trending|weekly" },
      { status: 400 }
    );
  }

  try {
    if (job === "inactive") {
      const result = await sendInactiveReaderReminders();
      return NextResponse.json({ ok: true, job, ...result });
    }
    if (job === "trending") {
      const result = await sendTrendingArticleAlert();
      return NextResponse.json({ ok: true, job, ...result });
    }
    const result = await sendWeeklyDigest();
    return NextResponse.json({ ok: true, job, ...result });
  } catch (err) {
    console.error("[cron notifications]", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
