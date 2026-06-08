"use client";

import type { FinanceHubData } from "@/lib/finance/types";
import { IndexCard } from "./index-card";
import { StockTable } from "./stock-table";
import { WatchlistPanel } from "./watchlist-panel";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface FinanceDashboardProps {
  data: FinanceHubData;
}

export function FinanceDashboard({ data }: FinanceDashboardProps) {
  return (
    <section className="rounded-2xl border border-border/50 bg-gradient-to-b from-muted/20 to-transparent overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/40 bg-muted/10">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-emerald-500" />
          <h2 className="font-display font-semibold text-sm">Markets Dashboard</h2>
          <Badge variant="outline" className="text-[9px] h-4 px-1.5">
            Live
          </Badge>
        </div>
        <p className="text-[9px] text-muted-foreground hidden sm:block">
          {new Date(data.updatedAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <IndexCard index={data.nifty} compact className="sm:col-span-1" />
          <IndexCard index={data.sensex} compact className="sm:col-span-1" />
          <div className="col-span-2 hidden sm:flex items-center rounded-lg border border-dashed border-border/40 px-3 text-[10px] text-muted-foreground">
            Indian markets · Nifty 50 constituents · Yahoo Finance data
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Panel title="Top Gainers" accent="emerald">
            <StockTable stocks={data.topGainers} compact />
          </Panel>
          <Panel title="Top Losers" accent="red">
            <StockTable stocks={data.topLosers} compact />
          </Panel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Panel title="Top 10 Stocks">
            <StockTable stocks={data.top10} compact />
          </Panel>
          <Panel title="My Watchlist">
            <WatchlistPanel defaultQuotes={data.top10.slice(0, 4)} />
          </Panel>
        </div>
      </div>
    </section>
  );
}

function Panel({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: "emerald" | "red";
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-background/40 overflow-hidden">
      <div className="px-3 py-1.5 border-b border-border/30">
        <h3
          className={`text-[10px] font-bold uppercase tracking-wider ${
            accent === "emerald"
              ? "text-emerald-500"
              : accent === "red"
                ? "text-red-500"
                : "text-muted-foreground"
          }`}
        >
          {title}
        </h3>
      </div>
      <div className="px-2 py-0.5">{children}</div>
    </div>
  );
}
