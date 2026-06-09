"use client";

import * as React from "react";
import { AddToWatchlistButton } from "./add-to-watchlist-button";
import { ChangeBadge } from "./change-badge";
import { FINANCE_STOCK_POLL_MS } from "@/lib/finance/constants";
import type { StockQuote } from "@/lib/finance/types";

export function LiveStockQuote({
  symbol,
  initialQuote,
  pollingMs = FINANCE_STOCK_POLL_MS,
}: {
  symbol: string;
  initialQuote: StockQuote;
  pollingMs?: number;
}) {
  const [quote, setQuote] = React.useState<StockQuote>(initialQuote);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const ac = new AbortController();

    async function tick() {
      if (typeof document === "undefined") return;
      if (document.visibilityState !== "visible") return;

      setLoading(true);
      try {
        const res = await fetch(
          `/api/finance/quotes?symbols=${encodeURIComponent(symbol)}`,
          { signal: ac.signal, cache: "no-store" }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { quotes?: StockQuote[] };
        const next = data.quotes?.[0];
        if (next && next.symbol) setQuote(next);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    void tick();
    timer = setInterval(() => void tick(), pollingMs);

    return () => {
      ac.abort();
      if (timer) clearInterval(timer);
    };
  }, [symbol, pollingMs]);

  return (
    <div className="text-right space-y-2">
      <p className="text-2xl font-bold tabular-nums">
        ₹{quote.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
      </p>
      <ChangeBadge
        change={quote.change}
        changePercent={quote.changePercent}
        size="sm"
      />
      <div className="flex justify-end">
        <AddToWatchlistButton symbol={quote.symbol} />
      </div>
      {loading && (
        <span className="sr-only" aria-live="polite">
          Updating market data
        </span>
      )}
    </div>
  );
}

