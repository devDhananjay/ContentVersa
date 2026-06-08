import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FinanceHubLive } from "./finance-hub-live";
import { getFinanceHubDataCached } from "@/lib/finance/data";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600";

export async function FinanceBrowseShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const hub = await getFinanceHubDataCached();

  return (
    <div className="-mt-2">
      <section className="relative h-[140px] md:h-[160px] overflow-hidden rounded-b-2xl mx-0">
        <Image
          src={HERO_IMAGE}
          alt="Finance Hub"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60" />
        <div className="container relative h-full flex flex-col justify-end pb-4">
          <Badge variant="outline" className="w-fit mb-1.5 text-[9px] gap-1 h-5">
            <TrendingUp className="h-2.5 w-2.5" /> Indian Markets
          </Badge>
          <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight">
            Finance Hub
          </h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground max-w-md">
            Live indices, movers, watchlist & stock charts
          </p>
        </div>
      </section>

      <div className="container py-5 space-y-6">
        <FinanceHubLive initialData={hub} />
        <div className="border-t border-border/40 pt-6">{children}</div>
      </div>
    </div>
  );
}
