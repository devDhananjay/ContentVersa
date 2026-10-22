"use client";

import * as React from "react";
import { Copy, Check, Loader2, RefreshCw, Bot } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type ChatRow = { id: string; title: string; type: string };

export function TelegramSetupWizard() {
  const [token, setToken] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [bot, setBot] = React.useState<{
    username?: string;
    name?: string;
  } | null>(null);
  const [chats, setChats] = React.useState<ChatRow[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [hint, setHint] = React.useState("");
  const [copiedEnv, setCopiedEnv] = React.useState(false);

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

  const envBlock = React.useMemo(() => {
    const ids = Array.from(selected).slice(0, 8).join(",");
    const t = token.trim();
    if (!t && !ids) return "";
    return [
      t ? `TELEGRAM_BOT_TOKEN=${t}` : "# TELEGRAM_BOT_TOKEN=paste-from-BotFather",
      ids
        ? `TELEGRAM_CHAT_IDS=${ids}`
        : "# TELEGRAM_CHAT_IDS=-100xxx,-100yyy",
    ].join("\n");
  }, [selected, token]);

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
        <h2 className="font-display text-lg font-bold">Telegram setup (app se nikaalo)</h2>
      </div>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
        <li>
          Telegram pe{" "}
          <a
            href="https://t.me/BotFather"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @BotFather
          </a>{" "}
          → <code className="text-xs">/newbot</code> → token copy
        </li>
        <li>Token neeche paste → Discover</li>
        <li>Bot ko group mein add karo + group mein 1 message → phir Discover dubara</li>
        <li>Groups tick karo → Copy .env → server pe daalo</li>
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
        <p className="text-[11px] text-muted-foreground">
          Token is request pe use hota hai — yahan save nahi hota. Empty chhodoge to
          server <code className="text-[10px]">TELEGRAM_BOT_TOKEN</code> try hoga.
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
          <p className="text-sm font-medium">Groups / chats (tick → env)</p>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
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
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="shrink-0"
                    onClick={async (e) => {
                      e.preventDefault();
                      await navigator.clipboard.writeText(c.id);
                      toast.success("Chat ID copied");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {envBlock ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">.env lines (server pe paste)</p>
          <pre className="rounded-xl border bg-background p-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
            {envBlock}
          </pre>
          <Button
            type="button"
            size="sm"
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
