import Image from "next/image";
import type { Metadata } from "next";
import { CATEGORIES, categoryPageHref } from "@/lib/data/categories";
import { getCategoriesWithCountsHybrid } from "@/lib/data/blog-db";
import { BandAd } from "@/components/ads/band-ad";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { MultiplexAd } from "@/components/ads/multiplex-ad";
import { PageBack } from "@/components/site/page-back";
import { LocaleLink } from "@/components/i18n/locale-link";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { withLocalePrefix } from "@/lib/i18n/config";
import { buildHreflangAlternates } from "@/lib/i18n/hreflang";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  return buildMetadata({
    title: t(dict, "hubs.categoriesTitle"),
    description: t(dict, "hubs.categoriesSub"),
    path: withLocalePrefix("/categories", locale),
    alternates: buildHreflangAlternates("/categories"),
  });
}

export default async function CategoriesIndex() {
  const withCounts = await getCategoriesWithCountsHybrid();
  const countBySlug = new Map(withCounts.map((c) => [c.slug, c.blogCount]));
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <div className="container py-12 md:py-20">
      <PageBack href="/" label={t(dict, "common.home")} className="mb-6" />
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-sm font-semibold uppercase tracking-widest text-neon-cyan">
          {t(dict, "hubs.categoriesBadge")}
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mt-3">
          {t(dict, "hubs.categoriesTitle")}
        </h1>
        <p className="text-muted-foreground mt-4">{t(dict, "hubs.categoriesSub")}</p>
      </div>

      <BandAd slotKey="horizontal" />
      <HubAdSense className="!px-0" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => {
          const count = countBySlug.get(cat.slug) ?? 0;
          const name = t(dict, `categories.${cat.slug}`, cat.name);
          return (
            <LocaleLink
              key={cat.slug}
              href={categoryPageHref(cat.slug)}
              className="group relative aspect-[16/10] overflow-hidden rounded-3xl border bg-card hover:border-transparent transition-all"
            >
              <Image
                src={cat.banner}
                alt={name}
                fill
                sizes="(min-width:1024px) 33vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={cn("absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent")} />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-60 group-hover:opacity-80 transition-opacity",
                  cat.color
                )}
              />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <h2 className="font-display text-2xl font-extrabold">{name}</h2>
                <p className="text-sm text-white/80 line-clamp-2 mt-1">
                  {t(dict, `catDesc.${cat.slug}`, cat.description)}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-white/70">
                  <span>
                    {count} {t(dict, "hubs.categoriesPosts")}
                  </span>
                  <span>·</span>
                  <span>
                    {cat.subcategories.length} {t(dict, "hubs.categoriesSubs")}
                  </span>
                </div>
              </div>
            </LocaleLink>
          );
        })}
      </div>

      <MultiplexAd />
    </div>
  );
}
