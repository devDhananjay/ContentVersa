import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import {
  sendTelegramTipMessage,
  tipMessageForSlot,
} from "@/lib/telegram/daily-tips";
import {
  TELEGRAM_DAY_PACKS,
  buildDayMessage,
} from "@/lib/admin/telegram-share-pack";

/**
 * Admin: send tip message now to selected (or env) chats.
 * Body: { token?, chatIds?, text?, useTodayPack?: boolean, slot?: number }
 */
export async function POST(req: Request) {
  try {
    await requireAdminApi();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    token?: string;
    chatIds?: string[];
    text?: string;
    useTodayPack?: boolean;
    slot?: number;
  };

  let text = (body.text || "").trim();
  if (!text && body.useTodayPack) {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
    const pack =
      TELEGRAM_DAY_PACKS[dayOfYear % TELEGRAM_DAY_PACKS.length]!;
    text = buildDayMessage(pack);
  }
  if (!text && typeof body.slot === "number") {
    text = tipMessageForSlot(body.slot);
  }
  if (!text) {
    return NextResponse.json(
      { error: "text, useTodayPack, or slot (0-5) required" },
      { status: 400 }
    );
  }

  const chatIds = Array.isArray(body.chatIds)
    ? body.chatIds.map(String).slice(0, 8)
    : undefined;

  try {
    const result = await sendTelegramTipMessage({
      text,
      token: body.token?.trim() || undefined,
      chatIds,
    });

    if (!result.configured) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Bot token + kam se kam 1 chat ID chahiye (form ya server .env)",
          ...result,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: result.sent > 0,
      preview: text.slice(0, 280),
      ...result,
    });
  } catch (err) {
    console.error("[admin/telegram/send]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Send failed" },
      { status: 500 }
    );
  }
}
