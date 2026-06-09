"use client";

import * as React from "react";
import type { FinanceTickerData } from "@/lib/finance/types";
import { MarketStrip } from "./market-strip";

export function MarketStripLive({
  initialData,
  embedded,
}: {
  initialData: FinanceTickerData;
  embedded?: boolean;
}) {
  const [data, setData] = React.useState(initialData);
  const lastKeyRef = React.useRef(initialData.updatedAt);

  React.useEffect(() => {
    const ac = new AbortController();

    async function tick() {
      if (document.visibilityState !== "visible") return;

      try {
        const res = await fetch("/api/finance/ticker", {
          signal: ac.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        const next = (await res.json()) as FinanceTickerData;
        if (next.updatedAt !== lastKeyRef.current) {
          lastKeyRef.current = next.updatedAt;
          setData(next);
        }
      } catch {
        // ignore transient errors
      }
    }

    const timer = setInterval(() => void tick(), 1000);
    return () => {
      ac.abort();
      clearInterval(timer);
    };
  }, []);

  return <MarketStrip data={data} embedded={embedded} />;
}
