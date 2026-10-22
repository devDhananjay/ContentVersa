import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

type TgChat = {
  id: number;
  type?: string;
  title?: string;
  username?: string;
  first_name?: string;
};

/**
 * Admin-only: given a bot token, call Telegram getUpdates / getMe
 * and list chats the bot has seen (for TELEGRAM_CHAT_IDS).
 * Token is NOT stored — only used for this request.
 */
export async function POST(req: Request) {
  try {
    await requireAdminApi();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { token?: string };
  const token = (body.token || process.env.TELEGRAM_BOT_TOKEN || "").trim();
  if (!token || !/^\d+:[A-Za-z0-9_-]+$/.test(token)) {
    return NextResponse.json(
      {
        error:
          "Valid bot token chahiye (BotFather se). Format: 123456:AAH...",
      },
      { status: 400 }
    );
  }

  const base = `https://api.telegram.org/bot${token}`;

  try {
    const meRes = await fetch(`${base}/getMe`);
    const meJson = (await meRes.json()) as {
      ok?: boolean;
      result?: { id: number; username?: string; first_name?: string };
      description?: string;
    };
    if (!meRes.ok || !meJson.ok || !meJson.result) {
      return NextResponse.json(
        { error: meJson.description || "Invalid token / getMe failed" },
        { status: 400 }
      );
    }

    const updRes = await fetch(`${base}/getUpdates?limit=100`);
    const updJson = (await updRes.json()) as {
      ok?: boolean;
      result?: Array<{
        message?: { chat?: TgChat };
        my_chat_member?: { chat?: TgChat };
        channel_post?: { chat?: TgChat };
      }>;
      description?: string;
    };

    if (!updRes.ok || !updJson.ok) {
      return NextResponse.json(
        { error: updJson.description || "getUpdates failed" },
        { status: 400 }
      );
    }

    const byId = new Map<string, { id: string; title: string; type: string }>();
    for (const u of updJson.result || []) {
      const chat =
        u.message?.chat || u.my_chat_member?.chat || u.channel_post?.chat;
      if (!chat?.id) continue;
      const id = String(chat.id);
      const title =
        chat.title ||
        [chat.first_name, chat.username].filter(Boolean).join(" ") ||
        id;
      byId.set(id, {
        id,
        title,
        type: chat.type || "unknown",
      });
    }

    // Also surface env-configured IDs so admin can verify
    const envIds = (process.env.TELEGRAM_CHAT_IDS || "")
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    return NextResponse.json({
      ok: true,
      bot: {
        id: meJson.result.id,
        username: meJson.result.username,
        name: meJson.result.first_name,
      },
      chats: Array.from(byId.values()),
      envChatIds: envIds,
      hint:
        byId.size === 0
          ? "Koi chat nahi mili. Bot ko group mein add karo, group mein ek message bhejo, phir yahan Refresh dabao."
          : "Jo groups chahiye unke ID select/copy karke .env mein TELEGRAM_CHAT_IDS pe daalo.",
    });
  } catch (err) {
    console.error("[admin/telegram/discover]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
