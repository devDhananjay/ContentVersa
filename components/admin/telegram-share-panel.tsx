"use client";

import * as React from "react";
import { Copy, Check, ExternalLink, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TELEGRAM_DAY_PACKS,
  TELEGRAM_JOB_LINKS,
  TELEGRAM_MONEY_LINKS,
  absoluteShareUrl,
  buildDayMessage,
  buildSingleLinkMessage,
  relatedGuidesForNewsTitle,
  type TelegramShareLink,
} from "@/lib/admin/telegram-share-pack";

export type TrendingNewsItem = {
  id: string;
  title: string;
  slug: string;
  path: string;
  views?: number;
};

type Tab = "today" | "days" | "money" | "jobs" | "news";

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied — Telegram pe paste karo`);
    return true;
  } catch {
    toast.error("Copy failed — manually select text");
    return false;
  }
}

function CopyButtons({
  fullMessage,
  url,
  className,
}: {
  fullMessage: string;
  url: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState<"msg" | "url" | null>(null);

  const mark = (kind: "msg" | "url") => {
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        type="button"
        size="sm"
        className="gap-1.5"
        onClick={async () => {
          if (await copyText(fullMessage, "Full tip")) mark("msg");
        }}
      >
        {copied === "msg" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        Copy tip + links
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1.5"
        onClick={async () => {
          if (await copyText(url, "Link")) mark("url");
        }}
      >
        {copied === "url" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        Copy link only
      </Button>
      <Button type="button" size="sm" variant="ghost" asChild>
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </a>
      </Button>
    </div>
  );
}

function RelatedChips({ related }: { related?: { label: string; path: string }[] }) {
  if (!related?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground self-center">
        Interlink
      </span>
      {related.map((r) => (
        <button
          key={r.path}
          type="button"
          className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground hover:border-orange-500/40 hover:text-foreground"
          onClick={() => void copyText(absoluteShareUrl(r.path), r.label)}
          title="Copy related link"
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function LinkCard({
  item,
  kind,
}: {
  item: TelegramShareLink;
  kind: "money" | "job";
}) {
  const url = absoluteShareUrl(item.path);
  const msg = buildSingleLinkMessage(item, kind);
  return (
    <div className="rounded-2xl border bg-card p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm leading-snug">{item.label}</p>
          {item.tip ? (
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.tip}</p>
          ) : null}
        </div>
        <Badge variant="outline">{kind}</Badge>
      </div>
      <p className="text-[11px] font-mono text-muted-foreground break-all">{url}</p>
      <RelatedChips related={item.related} />
      <CopyButtons fullMessage={msg} url={url} />
    </div>
  );
}

function todayDayIndex() {
  // Stable rotation: day-of-year mod 14 → 1..14
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return (dayOfYear % 14) + 1;
}

export function TelegramSharePanel({ news }: { news: TrendingNewsItem[] }) {
  const [tab, setTab] = React.useState<Tab>("today");
  const today = todayDayIndex();
  const todayPack = TELEGRAM_DAY_PACKS.find((d) => d.day === today) ?? TELEGRAM_DAY_PACKS[0];

  const tabs: { id: Tab; label: string }[] = [
    { id: "today", label: `Aaj (Day ${today})` },
    { id: "days", label: "14-day pack" },
    { id: "money", label: "Money links" },
    { id: "jobs", label: "Jobs links" },
    { id: "news", label: "Trending news" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground max-w-2xl">
        Button pe tap → clipboard → Telegram groups mein paste. Har tip mein related
        interlinks bhi hain.
      </p>
      <p className="text-xs text-muted-foreground max-w-2xl rounded-xl border border-sky-500/25 bg-sky-500/5 px-3 py-2">
        Auto (5–6×/day, 2–3h gap): BotFather token + group chat IDs → server{" "}
        <code className="text-[10px]">TELEGRAM_BOT_TOKEN</code> /{" "}
        <code className="text-[10px]">TELEGRAM_CHAT_IDS</code> — details{" "}
        <code className="text-[10px]">ops/telegram-bot-setup.md</code>. Max 8 chats,
        mass blast nahi.
      </p>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.id}
            type="button"
            size="sm"
            variant={tab === t.id ? "default" : "outline"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "today" && todayPack ? (
        <section className="rounded-2xl border border-orange-500/25 bg-orange-500/5 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-orange-500" />
            <h2 className="font-display text-lg font-bold">Aaj ka ready message</h2>
            <Badge variant="warning">Day {todayPack.day}</Badge>
          </div>
          <pre className="whitespace-pre-wrap rounded-xl border bg-background/80 p-4 text-xs leading-relaxed max-h-64 overflow-y-auto">
            {buildDayMessage(todayPack)}
          </pre>
          <CopyButtons
            fullMessage={buildDayMessage(todayPack)}
            url={absoluteShareUrl(todayPack.money.path)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <LinkCard item={todayPack.money} kind="money" />
            <LinkCard item={todayPack.job} kind="job" />
          </div>
        </section>
      ) : null}

      {tab === "days" ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold">14-day rotation</h2>
          <div className="grid gap-3">
            {TELEGRAM_DAY_PACKS.map((pack) => {
              const msg = buildDayMessage(pack);
              return (
                <div
                  key={pack.day}
                  className={cn(
                    "rounded-2xl border bg-card p-4 space-y-3",
                    pack.day === today && "border-orange-500/40"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={pack.day === today ? "warning" : "secondary"}>
                      Day {pack.day}
                    </Badge>
                    <span className="text-sm font-medium">
                      {pack.money.label} + {pack.job.label}
                    </span>
                  </div>
                  <CopyButtons fullMessage={msg} url={absoluteShareUrl(pack.money.path)} />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {tab === "money" ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold">Money — top links</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {TELEGRAM_MONEY_LINKS.map((item) => (
              <LinkCard key={item.id} item={item} kind="money" />
            ))}
          </div>
        </section>
      ) : null}

      {tab === "jobs" ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold">Jobs — top links</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {TELEGRAM_JOB_LINKS.map((item) => (
              <LinkCard key={item.id} item={item} kind="job" />
            ))}
          </div>
        </section>
      ) : null}

      {tab === "news" ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold">Trending / latest news</h2>
          <p className="text-xs text-muted-foreground">
            Live site se — har news tip mein related money/jobs guide interlink.
          </p>
          {!news.length ? (
            <p className="text-sm text-muted-foreground">Abhi koi trending item nahi mila.</p>
          ) : (
            <div className="grid gap-3">
              {news.map((n) => {
                const related = relatedGuidesForNewsTitle(n.title);
                const url = absoluteShareUrl(n.path);
                const msg = [
                  `📰 ${n.title}`,
                  ``,
                  `👉 ${url}`,
                  ...related.map((r) => `🔗 ${r.label}: ${absoluteShareUrl(r.path)}`),
                  ``,
                  `More news: ${absoluteShareUrl("/news")}`,
                  `Educational / news desk — ContentVerse India`,
                ].join("\n");
                return (
                  <div key={n.id} className="rounded-2xl border bg-card p-4 space-y-3">
                    <p className="font-semibold text-sm leading-snug">{n.title}</p>
                    <p className="text-[11px] font-mono text-muted-foreground break-all">{url}</p>
                    {typeof n.views === "number" ? (
                      <Badge variant="outline">{n.views} views</Badge>
                    ) : null}
                    <RelatedChips related={related} />
                    <CopyButtons fullMessage={msg} url={url} />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
