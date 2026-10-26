import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageBack } from "@/components/site/page-back";
import { FinanceHubLive } from "./finance-hub-live";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getFinanceHubDataCached } from "@/lib/finance/data";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600";

export async function FinanceBrowseShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const hub = await getFinanceHubDataCached();
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <div>
      <section className="relative h-[180px] md:h-[220px] overflow-hidden rounded-b-2xl mx-0">
        <Image
          src={HERO_IMAGE}
          alt={t(dict, "hubs.financeTitle")}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60" />
        <div className="container relative h-full flex flex-col justify-end pb-6">
          <PageBack href="/" label={t(dict, "common.home")} tone="onDark" className="mb-3" />
          <Badge variant="outline" className="w-fit mb-2 text-[10px] gap-1 h-5">
            <TrendingUp className="h-2.5 w-2.5" /> {t(dict, "hubs.financeBadge")}
          </Badge>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            {t(dict, "hubs.financeTitle")}
          </h1>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground max-w-md">
            {t(dict, "hubs.financeSub")}
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
