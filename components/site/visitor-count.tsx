"use client";

import * as React from "react";
import { Users } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function useVisitorCount() {
  const [count, setCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch("/api/site/stats", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { count?: number }) => {
        setCount(typeof data?.count === "number" ? data.count : 0);
      })
      .catch(() => setCount(0));
  }, []);

  React.useEffect(() => {
    const onRecorded = (e: Event) => {
      const detail = (e as CustomEvent<{ uniqueVisitors?: number }>).detail;
      if (typeof detail?.uniqueVisitors === "number" && detail.uniqueVisitors >= 0) {
        setCount(detail.uniqueVisitors);
      }
    };
    window.addEventListener("cv-site-visit", onRecorded);
    return () => window.removeEventListener("cv-site-visit", onRecorded);
  }, []);

  return count;
}

/** Live unique-visitor chip — matches production neon pill. */
export function VisitorCountBadge({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const count = useVisitorCount();
  const display = count === null ? "…" : formatNumber(count);
  const noun = count === 1 ? "reader" : "readers";

  return (
    <p
      className={cn(
        "inline-flex items-center rounded-full border border-neon-cyan/30 bg-neon-cyan/5 text-muted-foreground",
        size === "sm" ? "gap-1.5 px-3 py-1.5 text-xs" : "gap-2 px-4 py-2 text-sm",
        className
      )}
    >
      <Users
        className={cn(
          "shrink-0 text-neon-cyan",
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
        )}
      />
      <span>
        <span className="font-semibold tabular-nums text-foreground">{display}</span>{" "}
        {noun} so far
      </span>
    </p>
  );
}
