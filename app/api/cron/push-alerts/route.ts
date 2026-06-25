import { NextResponse } from "next/server";
import {
  sendCricketMatchReminders,
  sendStockWatchlistSessionAlerts,
} from "@/lib/notifications/push-alerts";

const JOBS = ["cricket", "stocks-open", "stocks-close"] as const;

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
      { error: "Invalid job. Use ?job=cricket|stocks-open|stocks-close" },
      { status: 400 }
    );
  }

  try {
    if (job === "cricket") {
      const result = await sendCricketMatchReminders();
      return NextResponse.json({ ok: true, job, ...result });
    }
    if (job === "stocks-open") {
      const result = await sendStockWatchlistSessionAlerts("open");
      return NextResponse.json({ ok: true, job, ...result });
    }
    const result = await sendStockWatchlistSessionAlerts("close");
    return NextResponse.json({ ok: true, job, ...result });
  } catch (err) {
    console.error("[cron push-alerts]", err);
    return NextResponse.json({ error: "Job failed" }, { status: 500 });
  }
}
