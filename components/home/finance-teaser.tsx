import Link from "next/link";
import { ArrowRight, TrendingUp, Wallet, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FinanceTickerData } from "@/lib/finance/types";
import { TOOL_REGISTRY } from "@/lib/tools/registry";

interface FinanceTeaserProps {
  data: FinanceTickerData | null;
}

function formatSignedPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function IndexTile({
  name,
  price,
  changePercent,
}: {
  name: string;
  price: number;
  changePercent: number;
}) {
  const up = changePercent >= 0;
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{name}</p>
      <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">
        {price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
      </p>
      <p className={`mt-1 text-sm font-semibold tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>
        {formatSignedPercent(changePercent)}
      </p>
    </div>
  );
}

export function FinanceTeaser({ data }: FinanceTeaserProps) {
  if (!data) return null;

  const gainers = data.topGainers.slice(0, 3);
  const toolsCount = TOOL_REGISTRY.length;

  return (
    <section className="container py-12 md:py-16" id="home-finance">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <Badge variant="neon" className="mb-2 gap-1">
            <TrendingUp className="h-3 w-3" /> Finance & Money
          </Badge>
          <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Markets & <span className="text-gradient">Money tools</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Live indices, movers, expense tools and free India utilities
          </p>
        </div>
        <Link href="/finance" className="hidden md:block">
          <Button variant="outline" className="gap-2">
            Open Finance Hub <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <IndexTile
            name={data.nifty.name}
            price={data.nifty.price}
            changePercent={data.nifty.changePercent}
          />
          <IndexTile
            name={data.sensex.name}
            price={data.sensex.price}
            changePercent={data.sensex.changePercent}
          />
          {gainers.length ? (
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:col-span-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Top movers
              </p>
              <ul className="grid gap-2 sm:grid-cols-3">
                {gainers.map((stock) => (
                  <li
                    key={stock.symbol}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-background/40 px-3 py-2 text-sm"
                  >
                    <span className="truncate font-semibold">{stock.symbol}</span>
                    <span
                      className={`shrink-0 tabular-nums font-semibold ${
                        stock.changePercent >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {formatSignedPercent(stock.changePercent)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3">
          <Link
            href="/moneyverse"
            className="flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 transition hover:bg-emerald-500/15"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <Wallet className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display font-bold">MoneyVerse</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                Expenses, Screenshot Scan and bank statement analyzer
              </span>
            </span>
          </Link>
          <Link
            href="/tools"
            className="flex items-start gap-3 rounded-2xl border border-teal-500/25 bg-teal-500/10 p-4 transition hover:bg-teal-500/15"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
              <Wrench className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display font-bold">India Tools</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {toolsCount} free utilities — IFSC, weather, EMI, nearby places
              </span>
            </span>
          </Link>
        </div>
      </div>

      <div className="mt-6 md:hidden">
        <Link href="/finance">
          <Button variant="gradient" className="w-full gap-2">
            Open Finance Hub <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
