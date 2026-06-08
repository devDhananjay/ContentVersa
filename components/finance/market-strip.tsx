"use client";

import Link from "next/link";
import type { FinanceTickerData, StockQuote } from "@/lib/finance/types";
import { displaySymbol } from "@/lib/finance/transformers";
import { ChangeBadge } from "./change-badge";
import { cn } from "@/lib/utils";

interface MarketStripProps {
  data: FinanceTickerData;
}

export function MarketStrip({ data }: MarketStripProps) {
  const gainers = data.topGainers;

  return (
    <div className="border-t border-border/40 bg-muted/20">
      <div className="flex items-center h-9 max-w-[100vw]">
        {/* Fixed indices — never scroll */}
        <div className="shrink-0 flex items-center gap-3 pl-4 pr-3 border-r border-border/40 bg-background/95 z-10">
          <Link href="/finance" className="hover:opacity-80 transition-opacity">
            <IndexPill
              label="Nifty 50"
              price={data.nifty.price}
              changePercent={data.nifty.changePercent}
            />
          </Link>
          <Link href="/finance" className="hover:opacity-80 transition-opacity">
            <IndexPill
              label="Sensex"
              price={data.sensex.price}
              changePercent={data.sensex.changePercent}
            />
          </Link>
        </div>

        {/* Auto-scrolling gainers */}
        <div className="flex-1 min-w-0 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background/95 to-transparent z-[1] pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background/95 to-transparent z-[1] pointer-events-none" />

          <div className="flex items-center h-9 animate-marquee hover:[animation-play-state:paused]">
            {[...gainers, ...gainers].map((stock, i) => (
              <GainerPill key={`${stock.symbol}-${i}`} stock={stock} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GainerPill({ stock }: { stock: StockQuote }) {
  return (
    <Link
      href={`/finance/stock/${displaySymbol(stock.symbol)}`}
      className={cn(
        "shrink-0 inline-flex items-center gap-1.5 mx-1.5",
        "rounded-md border border-border/50 bg-muted/30 px-2 py-0.5",
        "text-[10px] hover:border-emerald-500/30 transition-colors"
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
  return (
    <div className="shrink-0">
      <p className="text-[9px] font-medium text-muted-foreground uppercase leading-none">
        {label}
      </p>
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-[11px] font-semibold tabular-nums leading-none">
          {price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </span>
        <ChangeBadge change={0} changePercent={changePercent} size="xs" />
      </div>
    </div>
  );
}
