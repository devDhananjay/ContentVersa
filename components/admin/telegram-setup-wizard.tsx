"use client";

import * as React from "react";
import { Copy, Check, Loader2, RefreshCw, Bot, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

type ChatRow = { id: string; title: string; type: string };

export function TelegramSetupWizard() {
  const [token, setToken] = React.useState("");
  const [manualIds, setManualIds] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [bot, setBot] = React.useState<{
    username?: string;
    name?: string;
  } | null>(null);
  const [chats, setChats] = React.useState<ChatRow[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [hint, setHint] = React.useState("");
  const [copiedEnv, setCopiedEnv] = React.useState(false);
  const [lastSend, setLastSend] = React.useState<string>("");

  const resolveChatIds = React.useCallback(() => {
    const fromSelect = Array.from(selected);
    const fromManual = manualIds
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return Array.from(new Set([...fromSelect, ...fromManual])).slice(0, 8);
  }, [selected, manualIds]);

  const discover = async () => {
    setLoading(true);
    setHint("");
    try {
      const res = await fetch("/api/admin/telegram/discover", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() || undefined }),
      });
      const data = (await res.json()) as {
        error?: string;
        bot?: { username?: string; name?: string };
        chats?: ChatRow[];
        hint?: string;
        envChatIds?: string[];
      };
      if (!res.ok) throw new Error(data.error || "Failed");
      setBot(data.bot ?? null);
      setChats(data.chats ?? []);
      setHint(data.hint || "");
      const next = new Set(selected);
      for (const id of data.envChatIds ?? []) next.add(id);
      for (const c of data.chats ?? []) {
        if (c.type === "group" || c.type === "supergroup" || c.type === "channel") {
          next.add(c.id);
        }
      }
      setSelected(next);
      toast.success(
        data.chats?.length
          ? `${data.chats.length} chat(s) mili`
          : "Bot OK — abhi koi group update nahi"
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Discover failed");
    } finally {
      setLoading(false);
    }
  };

  const sendNow = async (mode: "today" | "slot0") => {
    const chatIds = resolveChatIds();
    if (!token.trim() && chatIds.length === 0) {
      toast.error("Token + kam se kam 1 chat ID chahiye");
      return;
    }
    if (chatIds.length === 0) {
      toast.error("Group chat ID select/paste karo (max 8)");
      return;
    }
    setSending(true);
    setLastSend("");
    try {
      const res = await fetch("/api/admin/telegram/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim() || undefined,
          chatIds,
          useTodayPack: mode === "today",
          slot: mode === "slot0" ? 0 : undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        ok?: boolean;
        sent?: number;
        chats?: number;
        results?: { chatId: string; ok: boolean; error?: string }[];
        preview?: string;
      };
      if (!res.ok) throw new Error(data.error || "Send failed");
      const fails = (data.results || []).filter((r) => !r.ok);
      setLastSend(
        `Sent ${data.sent}/${data.chats}` +
          (fails.length
            ? ` — fails: ${fails.map((f) => `${f.chatId}: ${f.error}`).join("; ")}`
            : "")
      );
      if (data.sent && data.sent > 0) {
        toast.success(`Telegram pe bhej diya (${data.sent} chat)`);
      } else {
        toast.error(data.error || "Kisi chat pe nahi gaya — bot admin/permission check");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  const envBlock = React.useMemo(() => {
    const ids = resolveChatIds().join(",");
    const t = token.trim();
    if (!t && !ids) return "";
    return [
      t ? `TELEGRAM_BOT_TOKEN=${t}` : "# TELEGRAM_BOT_TOKEN=paste-from-BotFather",
      ids ? `TELEGRAM_CHAT_IDS=${ids}` : "# TELEGRAM_CHAT_IDS=-100xxx,-100yyy",
    ].join("\n");
  }, [resolveChatIds, token]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else {
        if (n.size >= 8) {
          toast.error("Max 8 chats (mass nahi)");
          return prev;
        }
        n.add(id);
      }
      return n;
    });
  };

  return (
    <section className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-sky-500" />
        <h2 className="font-display text-lg font-bold">Telegram — setup + Send now</h2>
      </div>
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
        Cursor / browser se <code className="text-[10px]">t.me</code> aksar blank rehta hai.
        Phone pe Telegram app kholo, ya niche Web Telegram use karo.
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" asChild>
          <a
            href="https://web.telegram.org/k/#@BotFather"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open BotFather (Web)
          </a>
        </Button>
        <Button type="button" size="sm" variant="outline" asChild>
          <a href="tg://resolve?domain=BotFather">Open in Telegram app</a>
        </Button>
      </div>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
        <li>
          BotFather → <code className="text-xs">/newbot</code> → token copy (ya pehle se bana ho to{" "}
          <code className="text-xs">/token</code>)
        </li>
        <li>Token yahan paste → Discover / chat IDs</li>
        <li>
          Bot ko group mein <strong className="text-foreground">admin</strong> banao (post
          permission)
        </li>
        <li>
          <strong className="text-foreground">Send today tip</strong> — message abhi jayega
        </li>
      </ol>

      <div className="space-y-2">
        <Label htmlFor="tg-token">Bot token (BotFather)</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="tg-token"
            type="password"
            autoComplete="off"
            placeholder="123456:AAH..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="font-mono text-xs"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => void discover()}
            disabled={loading}
            className="gap-1.5 shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Discover chats
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tg-ids">Chat IDs (comma-separated, max 8)</Label>
        <Textarea
          id="tg-ids"
          placeholder="-1001234567890, -1009876543210"
          value={manualIds}
          onChange={(e) => setManualIds(e.target.value)}
          className="font-mono text-xs min-h-[64px]"
        />
        <p className="text-[11px] text-muted-foreground">
          ID nahi pata? Discover use karo, ya group mein{" "}
          <code className="text-[10px]">@userinfobot</code> add karke ID maango.
        </p>
      </div>

      {bot ? (
        <p className="text-sm">
          Bot:{" "}
          <Badge variant="secondary">
            @{bot.username || "unknown"} {bot.name ? `(${bot.name})` : ""}
          </Badge>
        </p>
      ) : null}

      {hint ? <p className="text-xs text-amber-700 dark:text-amber-400">{hint}</p> : null}

      {chats.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Discovered chats (tick)</p>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {chats.map((c) => (
              <li key={c.id}>
                <label className="flex items-start gap-3 rounded-xl border bg-background/80 p-3 cursor-pointer hover:border-sky-500/40">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selected.has(c.id)}
                    onChange={() => toggle(c.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="font-medium text-sm block truncate">{c.title}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {c.id} · {c.type}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          className="gap-1.5"
          disabled={sending}
          onClick={() => void sendNow("today")}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send today tip (money + job)
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-1.5"
          disabled={sending}
          onClick={() => void sendNow("slot0")}
        >
          <Send className="h-4 w-4" />
          Send slot-0 tip
        </Button>
      </div>
      {lastSend ? (
        <p className="text-xs text-muted-foreground font-mono break-all">{lastSend}</p>
      ) : null}

      {envBlock ? (
        <div className="space-y-2 border-t border-border/50 pt-4">
          <p className="text-sm font-medium">Daily auto (cron) ke liye .env</p>
          <pre className="rounded-xl border bg-background p-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
            {envBlock}
          </pre>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="gap-1.5"
            onClick={async () => {
              await navigator.clipboard.writeText(envBlock);
              setCopiedEnv(true);
              toast.success(".env block copied");
              window.setTimeout(() => setCopiedEnv(false), 1500);
            }}
          >
            {copiedEnv ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            Copy .env block
          </Button>
        </div>
      ) : null}
    </section>
  );
}
