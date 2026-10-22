/**
 * Light Telegram tip poster — 5–6 sends / day (cron slots), not mass blast.
 * Requires TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_IDS (comma-separated).
 */
import {
  TELEGRAM_DAY_PACKS,
  TELEGRAM_JOB_LINKS,
  TELEGRAM_MONEY_LINKS,
  buildDayMessage,
  buildSingleLinkMessage,
} from "@/lib/admin/telegram-share-pack";

const API = "https://api.telegram.org";

export function getTelegramChatIds(): string[] {
  const raw = process.env.TELEGRAM_CHAT_IDS?.trim() || "";
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8); // hard cap — not a mass blaster
}

export function isTelegramTipsConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim() && getTelegramChatIds().length);
}

/** IST-oriented slots 0..5 → pick rotating tip text */
export function tipMessageForSlot(slot: number): string {
  const s = ((slot % 6) + 6) % 6;
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
  const pack = TELEGRAM_DAY_PACKS[dayOfYear % TELEGRAM_DAY_PACKS.length]!;

  // Slots 0 & 3: full money + job day pack
  if (s === 0 || s === 3) return buildDayMessage(pack);

  // Odd slots: money single (rotate)
  if (s === 1 || s === 4) {
    const m =
      TELEGRAM_MONEY_LINKS[(dayOfYear + s) % TELEGRAM_MONEY_LINKS.length]!;
    return buildSingleLinkMessage(m, "money");
  }

  // Even remaining: job single
  const j = TELEGRAM_JOB_LINKS[(dayOfYear + s) % TELEGRAM_JOB_LINKS.length]!;
  return buildSingleLinkMessage(j, "job");
}

async function sendToChat(
  token: string,
  chatId: string,
  text: string
): Promise<{ chatId: string; ok: boolean; error?: string }> {
  const url = `${API}/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: false,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    description?: string;
  };
  if (!res.ok || !json.ok) {
    return {
      chatId,
      ok: false,
      error: json.description || `HTTP ${res.status}`,
    };
  }
  return { chatId, ok: true };
}

export async function postTelegramDailyTips(slot: number): Promise<{
  configured: boolean;
  slot: number;
  chats: number;
  sent: number;
  results: { chatId: string; ok: boolean; error?: string }[];
  preview: string;
}> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
  const chatIds = getTelegramChatIds();
  const text = tipMessageForSlot(slot);

  if (!token || !chatIds.length) {
    return {
      configured: false,
      slot,
      chats: 0,
      sent: 0,
      results: [],
      preview: text.slice(0, 200),
    };
  }

  const results: { chatId: string; ok: boolean; error?: string }[] = [];
  for (const chatId of chatIds) {
    // Small gap between chats so Telegram is less likely to rate-limit
    if (results.length) await new Promise((r) => setTimeout(r, 800));
    results.push(await sendToChat(token, chatId, text));
  }

  return {
    configured: true,
    slot,
    chats: chatIds.length,
    sent: results.filter((r) => r.ok).length,
    results,
    preview: text.slice(0, 240),
  };
}
