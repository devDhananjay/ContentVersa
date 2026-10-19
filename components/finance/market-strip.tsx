"use client";

import Link from "next/link";
import type { FinanceTickerData, StockQuote } from "@/lib/finance/types";
import { displaySymbol } from "@/lib/finance/transformers";
import { ChangeBadge } from "./change-badge";
import { cn } from "@/lib/utils";

interface MarketStripProps {
  data: FinanceTickerData;
  /** When true, aligns with in-card padding instead of page container */
  embedded?: boolean;
}

export function MarketStrip({ data, embedded }: MarketStripProps) {
  const gainers = data.topGainers;

  const row = (
    <div
      className={cn(
        "flex items-center h-12 py-1.5 min-w-0 overflow-hidden",
        embedded ? "px-5" : ""
      )}
    >
        {/* Fixed indices — never scroll */}
        <div className="z-10 flex shrink-0 items-center gap-2 pr-3">
          <Link href="/finance" className="transition-transform hover:-translate-y-px">
            <IndexPill
              label="Nifty 50"
              price={data.nifty.price}
              changePercent={data.nifty.changePercent}
            />
          </Link>
          <Link
            href="/finance"
            className="hidden transition-transform hover:-translate-y-px sm:block"
          >
            <IndexPill
              label="Sensex"
              price={data.sensex.price}
              changePercent={data.sensex.changePercent}
            />
          </Link>
        </div>

        {/* Auto-scrolling gainers — absolute so max-content width cannot expand the page */}
        <div className="relative h-9 min-w-0 flex-1 overflow-hidden [contain:paint] [isolation:isolate]">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-[1] w-6 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-[1] w-6 bg-gradient-to-l from-background to-transparent" />

          <div className="absolute inset-0 overflow-hidden">
            <div className="flex h-full items-center animate-marquee hover:[animation-play-state:paused]">
              {[...gainers, ...gainers].map((stock, i) => (
                <GainerPill key={`${stock.symbol}-${i}`} stock={stock} />
              ))}
            </div>
          </div>
        </div>
      </div>
  );

  return (
    <div className="overflow-x-hidden border-t border-border/50 bg-background">
      {embedded ? row : <div className="container min-w-0 overflow-hidden">{row}</div>}
    </div>
  );
}

function GainerPill({ stock }: { stock: StockQuote }) {
  return (
    <Link
      href={`/finance/stock/${displaySymbol(stock.symbol)}`}
      className={cn(
        "shrink-0 inline-flex items-center gap-2 mx-2",
        "rounded-full border border-border/70 bg-card px-3 py-1 shadow-sm",
        "text-[10px] hover:border-primary/40 transition-colors"
      )}
    >
      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/80">
        ▲
      </span>
      <span className="font-medium">{displaySymbol(stock.symbol)}</span>
      <ChangeBadge
        change={stock.change}
        changePercent={stock.changePercent}
        size="xs"
      />
    </Link>
  );
}

function IndexPill({
  label,
  price,
  changePercent,
}: {
  label: string;
  price: number;
  changePercent: number;
}) {
  const up = changePercent >= 0;
  return (
    <div
      className={cn(
        "shrink-0 rounded-full border px-2.5 py-1 shadow-sm sm:px-3.5 sm:py-1.5",
        "bg-card",
        up ? "border-emerald-500/30" : "border-red-500/30"
      )}
    >
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground leading-none">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="text-[12px] font-semibold tabular-nums leading-none">
          {price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </span>
        <ChangeBadge change={0} changePercent={changePercent} size="xs" />
      </div>
    </div>
  );
}
