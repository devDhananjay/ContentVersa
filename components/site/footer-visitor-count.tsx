"use client";

import * as React from "react";
import { Users } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function FooterVisitorCount() {
  const [count, setCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch("/api/site/stats", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { count?: number }) => setCount(data.count ?? 0))
      .catch(() => setCount(0));
  }, []);

  React.useEffect(() => {
    const onRecorded = (e: Event) => {
      const detail = (e as CustomEvent<{ uniqueVisitors?: number }>).detail;
      if (typeof detail?.uniqueVisitors === "number") {
        setCount(detail.uniqueVisitors);
      }
    };
    window.addEventListener("cv-site-visit", onRecorded);
    return () => window.removeEventListener("cv-site-visit", onRecorded);
  }, []);

  if (count === null) return null;

  return (
    <div className="mt-12 flex justify-center">
      <p className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4 text-neon-cyan shrink-0" />
        <span>
          <span className="font-semibold text-foreground tabular-nums">
            {formatNumber(count)}
          </span>{" "}
          website {count === 1 ? "visitor" : "visitors"} so far
        </span>
      </p>
    </div>
  );
}
