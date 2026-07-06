import Image from "next/image";
import { Gem } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GoldPriceHub } from "./gold-price-hub";
import { getGoldPriceSnapshot } from "@/lib/goldverse/gold-price";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600";

export async function GoldVerseBrowseShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const gold = await getGoldPriceSnapshot();

  return (
    <div>
      <section className="relative mx-0 h-[210px] overflow-hidden rounded-b-2xl md:h-[260px]">
        <Image
          src={HERO_IMAGE}
          alt="GoldVerse — Gold HUID verification India"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/80 via-background/90 to-background/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.15),transparent_55%)]" />
        <div className="container relative flex h-full flex-col justify-end pb-6">
          <Badge
            variant="outline"
            className="mb-2 h-5 w-fit gap-1 border-amber-500/40 text-[10px] text-amber-200"
          >
            <Gem className="h-2.5 w-2.5" /> BIS Hallmark · India
          </Badge>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-4xl">
            Gold<span className="text-amber-400">Verse</span>
          </h1>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground md:text-sm">
            HUID verify, gold rates, hallmark guide & BIS tools — for buyers and
            jewellers across India
          </p>
        </div>
      </section>

      <div className="container space-y-8 py-6">
        <GoldPriceHub initial={gold} />
        <div className="border-t border-amber-500/10 pt-2">{children}</div>
      </div>
    </div>
  );
}
