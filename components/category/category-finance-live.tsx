import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";
import { MarketStripLive } from "@/components/finance/market-strip-live";
import { Button } from "@/components/ui/button";
import { getFinanceTickerDataCached } from "@/lib/finance/data";

export async function CategoryFinanceLive() {
  let data;
  try {
    data = await getFinanceTickerDataCached();
  } catch {
    return null;
  }

  return (
    <section className="mb-10 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border/50 bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500/90">
              Live markets
            </span>
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight">
            Indian markets
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Nifty, Sensex and top movers — updated live
          </p>
        </div>
        <Link href="/finance">
          <Button variant="outline" size="sm" className="gap-2">
            Open finance hub <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <MarketStripLive initialData={data} embedded />
    </section>
  );
}
