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
  RefreshCw,
  FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardNotification } from "@/lib/data/dashboard-data";

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

type VerifyPayload = {
  database?: boolean;
  inApp?: {
    total: number;
    unread: number;
    lastAt: string | null;
    lastType?: string | null;
    lastTitle?: string | null;
  };
  push?: {
    tokens: number;
    serverConfigured: boolean;
    serverReason?: string | null;
    vapidConfigured: boolean;
    clientConfigured?: boolean;
  };
  admin?: { totalLast24h: number; last24hByType: Record<string, number> } | null;
};

export function NotificationsClient({
  initialItems,
  initialUnread,
  isSuperAdmin = false,
}: {
  initialItems: DashboardNotification[];
  initialUnread: number;
  isSuperAdmin?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = React.useState(initialItems);
  const [unread, setUnread] = React.useState(initialUnread);
  const [markingAll, setMarkingAll] = React.useState(false);
  const [openingId, setOpeningId] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [verify, setVerify] = React.useState<VerifyPayload | null>(null);
  const [showVerify, setShowVerify] = React.useState(false);

  const loadVerify = React.useCallback(async () => {
    const res = await fetch("/api/notifications/verify", {
      credentials: "include",
    });
    if (!res.ok) return;
    setVerify((await res.json()) as VerifyPayload);
  }, []);

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

  React.useEffect(() => {
    void refresh();
    void loadVerify();
  }, [refresh, loadVerify]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
      await loadVerify();
      router.refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/notifications/test", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return;
      await refresh();
      await loadVerify();
      router.refresh();
    } finally {
      setTesting(false);
    }
  };

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
      <div className="rounded-2xl border bg-muted/30 p-4 text-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium text-foreground">Verify notifications</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={refreshing}
              onClick={handleRefresh}
            >
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              )}
              Refresh
            </Button>
            {isSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                disabled={testing}
                onClick={sendTest}
              >
                {testing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
                )}
                Send test
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVerify((v) => !v)}
            >
              {showVerify ? "Hide details" : "Details"}
            </Button>
          </div>
        </div>
        {verify?.inApp && (
          <p className="text-muted-foreground text-xs">
            In-app: {verify.inApp.total} total, {verify.inApp.unread} unread
            {verify.inApp.lastAt
              ? ` · last ${new Date(verify.inApp.lastAt).toLocaleString()}`
              : " · none yet — approve a blog or (Super Admin) Send test"}
          </p>
        )}
        {showVerify && verify && (
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
            <li>
              Push tokens on this account: {verify.push?.tokens ?? 0}
              {verify.push?.tokens === 0
                ? " (allow notifications in browser when signed in)"
                : ""}
            </li>
            <li>
              Browser Firebase (VAPID):{" "}
              {verify.push?.vapidConfigured ? "yes" : "missing on server"}
            </li>
            <li>
              Server push (FCM send):{" "}
              {verify.push?.serverConfigured
                ? "configured"
                : verify.push?.serverReason === "empty" ||
                    verify.push?.serverReason === "missing"
                  ? "not set — add FIREBASE_ADMIN_CREDENTIALS on server (service account JSON)"
                  : verify.push?.serverReason === "invalid_json"
                    ? "invalid JSON in FIREBASE_ADMIN_CREDENTIALS"
                    : "not configured (in-app still works)"}
            </li>
            {verify.admin && (
              <li>
                Admin — notifications sent site-wide in last 24h:{" "}
                {verify.admin.totalLast24h}{" "}
                {Object.keys(verify.admin.last24hByType).length > 0 &&
                  `(${Object.entries(verify.admin.last24hByType)
                    .map(([t, c]) => `${t}: ${c}`)
                    .join(", ")})`}
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
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
