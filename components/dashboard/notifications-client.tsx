"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Heart,
  MessageCircle,
  ThumbsUp,
  UserPlus,
  XCircle,
  Bell,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardNotification } from "@/lib/data/dashboard-data";
import { EnablePushButton } from "@/components/notifications/enable-push-button";

const ICON_MAP = {
  approval: CheckCircle2,
  follow: UserPlus,
  like: Heart,
  comment: MessageCircle,
  achievement: ThumbsUp,
  rejection: XCircle,
  system: Bell,
};

const COLOR_MAP = {
  approval: "text-green-500 bg-green-500/10",
  follow: "text-neon-blue bg-neon-blue/10",
  like: "text-neon-pink bg-neon-pink/10",
  comment: "text-neon-purple bg-neon-purple/10",
  achievement: "text-neon-orange bg-neon-orange/10",
  rejection: "text-destructive bg-destructive/10",
  system: "text-muted-foreground bg-muted",
};

function normalizeHref(link?: string | null): string | null {
  if (!link?.trim()) return null;
  const trimmed = link.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function NotificationsClient({
  initialItems,
  initialUnread,
}: {
  initialItems: DashboardNotification[];
  initialUnread: number;
}) {
  const router = useRouter();
  const [items, setItems] = React.useState(initialItems);
  const [unread, setUnread] = React.useState(initialUnread);
  const [markingAll, setMarkingAll] = React.useState(false);
  const [openingId, setOpeningId] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    const res = await fetch("/api/notifications", { credentials: "include" });
    if (!res.ok) return;
    const data = (await res.json()) as {
      data?: DashboardNotification[];
      unread?: number;
    };
    setItems(data.data ?? []);
    setUnread(data.unread ?? 0);
  }, []);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) return;
      setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
      setUnread(0);
      router.refresh();
    } finally {
      setMarkingAll(false);
    }
  };

  const openNotification = async (n: DashboardNotification) => {
    const href = normalizeHref(n.link);
    setOpeningId(n.id);
    try {
      if (n.unread) {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: n.id }),
        });
        setItems((prev) =>
          prev.map((item) =>
            item.id === n.id ? { ...item, unread: false } : item
          )
        );
        setUnread((c) => Math.max(0, c - 1));
      }
      if (href) {
        router.push(href);
      }
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <EnablePushButton onEnabled={refresh} />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={markingAll || unread === 0}
          onClick={markAllRead}
        >
          {markingAll ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              Marking…
            </>
          ) : (
            "Mark all read"
          )}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
          No notifications yet.
        </div>
      ) : (
      <div className="space-y-3">
        {items.map((n) => {
          const Icon = ICON_MAP[n.icon] ?? Bell;
          const href = normalizeHref(n.link);
          const busy = openingId === n.id;

          return (
            <button
              key={n.id}
              type="button"
              disabled={busy}
              onClick={() => openNotification(n)}
              className={cn(
                "w-full text-left flex items-start gap-4 p-4 rounded-2xl border bg-card transition-colors",
                "hover:border-neon-purple/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/50",
                n.unread && "ring-1 ring-neon-purple/30",
                !href && "cursor-default",
                busy && "opacity-70"
              )}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  COLOR_MAP[n.icon]
                )}
              >
                {busy ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">{n.title}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                {href && (
                  <p className="text-xs text-neon-purple mt-1.5 truncate">
                    Open {href.startsWith("/blog/") ? "article" : "page"} →
                  </p>
                )}
              </div>
              {n.unread && (
                <div className="h-2 w-2 rounded-full bg-neon-pink shrink-0 mt-2" />
              )}
            </button>
          );
        })}
      </div>
      )}
    </div>
  );
}
