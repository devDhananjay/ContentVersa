import { NextResponse } from "next/server";
import { postTelegramDailyTips } from "@/lib/telegram/daily-tips";

function authorize(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const query = new URL(req.url).searchParams.get("secret");
  return bearer === secret || query === secret;
}

/**
 * Light tip cadence: call with ?slot=0..5 (6× / day ≈ every 2–3h IST).
 * Example crontab (IST via TZ=Asia/Kolkata):
 *   0 8,11,14,17,20,22 * * * ... telegram-tips.sh 0|1|2|3|4|5
 */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = new URL(req.url).searchParams.get("slot") ?? "0";
  const slot = Number.parseInt(raw, 10);
  if (!Number.isFinite(slot) || slot < 0 || slot > 5) {
    return NextResponse.json(
      { error: "Use ?slot=0..5 (six sends max per day)" },
      { status: 400 }
    );
  }

  try {
    const result = await postTelegramDailyTips(slot);
    if (!result.configured) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_IDS in server .env (max 8 chats)",
          ...result,
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/telegram-tips]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
