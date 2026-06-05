import { NextResponse } from "next/server";
import { syncSportsData } from "@/lib/sports/sync";

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

  try {
    const result = await syncSportsData();
    return NextResponse.json({
      ok: result.ok,
      status: result.status,
      endpoints: result.endpoints,
      durationMs: result.durationMs,
      errors: result.errors.slice(0, 20),
      errorCount: result.errors.length,
    });
  } catch (err) {
    console.error("[cron sports-sync]", err);
    return NextResponse.json({ error: "Sports sync failed" }, { status: 500 });
  }
}

export const maxDuration = 300;
