import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StockChart } from "@/components/finance/stock-chart";
import { getStockDetailCached } from "@/lib/finance/data";
import { displaySymbol } from "@/lib/finance/transformers";
import { buildMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { LiveStockQuote } from "@/components/finance/live-stock-quote";

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol } = await params;
  const data = await getStockDetailCached(symbol);
  const name = data?.quote.shortName ?? displaySymbol(symbol);

  return buildMetadata({
    title: `${name} Stock Price`,
    description: `Live ${name} stock price, chart and market data on ContentVerse Finance Hub.`,
    path: `/finance/stock/${symbol}`,
    noIndex: true,
  });
}

export default async function StockDetailPage({ params }: PageProps) {
  const { symbol } = await params;
  const data = await getStockDetailCached(symbol);

  if (!data) notFound();

  const { quote, chart } = data;

  return (
    <div className="container py-8 max-w-4xl">
      <Link
        href="/finance"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Finance Hub
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <Badge variant="outline" className="mb-2 text-xs">
            {quote.symbol}
          </Badge>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            {quote.shortName}
          </h1>
        </div>
        <LiveStockQuote symbol={quote.symbol} initialQuote={quote} pollingMs={1000} />
      </div>

      <div className="rounded-xl border border-border/60 bg-card/50 p-4 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Historical Chart (3 months)
        </h2>
        <StockChart data={chart} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Prev Close" value={quote.previousClose} />
        <Stat label="Day High" value={quote.dayHigh} />
        <Stat label="Day Low" value={quote.dayLow} />
        <Stat
          label="Volume"
          value={quote.volume}
          format="compact"
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  format,
}: {
  label: string;
  value?: number;
  format?: "compact";
}) {
  const display =
    value == null
      ? "—"
      : format === "compact"
        ? value.toLocaleString("en-IN", { notation: "compact" })
        : `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold tabular-nums mt-0.5">{display}</p>
    </div>
  );
}
