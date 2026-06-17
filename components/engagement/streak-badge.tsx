"use client";

import * as React from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { useSession } from "@/components/auth/use-session";
import { cn } from "@/lib/utils";

type StreakData = {
  streakDays: number;
  todayQualified: boolean;
};

export function StreakBadge({ className }: { className?: string }) {
  const { user, loading } = useSession();
  const [streak, setStreak] = React.useState<StreakData | null>(null);
  const [tick, setTick] = React.useState(0);

  const load = React.useCallback(() => {
    if (!user) return;
    fetch("/api/me/streak", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: StreakData | null) => {
        if (data) setStreak(data);
      })
      .catch(() => {});
  }, [user]);

  React.useEffect(() => {
    if (!user) {
      setStreak(null);
      return;
    }
    load();
  }, [user, load, tick]);

  React.useEffect(() => {
    if (!user) return;
    const onRefresh = () => setTick((n) => n + 1);
    window.addEventListener("cv-streak-refresh", onRefresh);
    return () => window.removeEventListener("cv-streak-refresh", onRefresh);
  }, [user]);

  if (loading || !user) return null;

  const days = streak?.streakDays ?? 0;
  const lit = streak?.todayQualified ?? false;

  return (
    <Link
      href="/dashboard"
      title={
        lit
          ? `${days}-day streak — today's goal complete`
          : `Read 1 min today to keep your ${days || "new"} streak`
      }
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold transition-colors shrink-0",
        lit
          ? "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400"
          : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent/40",
        className
      )}
    >
      <Flame
        className={cn("h-3.5 w-3.5", lit && "text-orange-500 fill-orange-500/30")}
      />
      <span>{days}</span>
    </Link>
  );
}

export function refreshStreakBadge() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("cv-streak-refresh"));
}
