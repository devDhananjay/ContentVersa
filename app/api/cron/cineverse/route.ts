import { NextResponse } from "next/server";
import { sendCineverseTrailerAlerts } from "@/lib/notifications/cineverse-trailers";
import { sendOttWeeklyDigest } from "@/lib/notifications/ott-weekly";

function authorize(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const query = new URL(req.url).searchParams.get("secret");
  return bearer === secret || query === secret;
}

/** ?job=trailers | ott-weekly */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const job = new URL(req.url).searchParams.get("job") ?? "trailers";

  try {
    if (job === "ott-weekly") {
      const result = await sendOttWeeklyDigest();
      return NextResponse.json({ ok: true, job, ...result });
    }
    const result = await sendCineverseTrailerAlerts();
    return NextResponse.json({ ok: true, job: "trailers", ...result });
  } catch (err) {
    console.error("[cron cineverse]", err);
    return NextResponse.json({ error: "Job failed" }, { status: 500 });
  }
}
