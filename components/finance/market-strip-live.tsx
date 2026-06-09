"use client";

import * as React from "react";
import { FINANCE_TICKER_POLL_MS } from "@/lib/finance/constants";
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

    void tick();
    const timer = setInterval(() => void tick(), FINANCE_TICKER_POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      ac.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <MarketStrip data={data} embedded={embedded} />;
}
