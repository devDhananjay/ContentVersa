import type { Metadata } from "next";
import { Radio } from "lucide-react";
import { StickyRailAd } from "@/components/ads/sticky-rail-ad";
import { NewsDeskClient } from "@/components/news/news-desk-client";
import { getNewsDesk } from "@/lib/data/live-news";
import { buildMetadata, SITE } from "@/lib/seo";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t, tf } from "@/lib/i18n/get-dictionary";
import { buildHreflangAlternates } from "@/lib/i18n/hreflang";
import { withLocalePrefix } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const path = withLocalePrefix("/news", locale);
  const newsBase = buildMetadata({
    title: `${t(dict, "news.title")} — ${t(dict, "news.subtitle")} | ContentVerse India`,
    description:
      locale === "hi"
        ? "भारत की लाइव न्यूज़ ब्रीफ़िंग — राजनीति, बिज़नेस, खेल और टॉप स्टोरीज़।"
        : "Live India news briefings rewritten for ContentVerse readers — politics, business, sports and top stories, updated through the day.",
    path,
    keywords: [
      "India live news",
      "ContentVerse news",
      "India headlines",
      "news briefings India",
    ],
    alternates: buildHreflangAlternates("/news"),
  });
  return {
    ...newsBase,
    alternates: {
      ...newsBase.alternates,
      types: {
        "application/rss+xml": `${SITE.url}/news-sitemap.xml`,
      },
    },
  };
}

export default async function NewsHubPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const desk = await getNewsDesk(600);
  const briefings = desk.items.filter((i) => i.hasBriefing);

  const listJsonLd =
    briefings.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Live News — ContentVerse India",
          description:
            "India desk news briefings updated through the day on ContentVerse India.",
          url: `${SITE.url}${withLocalePrefix("/news", locale)}`,
          isPartOf: { "@id": `${SITE.url}/#website` },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: briefings.slice(0, 20).map((b, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: b.href.startsWith("http")
                ? b.href
                : `${SITE.url}${withLocalePrefix(b.href, locale)}`,
              name: b.title,
            })),
          },
        }
      : null;

  return (
    <div className="container py-8 md:py-12 pb-16">
      {listJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }}
        />
      ) : null}
      <div className="flex items-start justify-center gap-4 lg:gap-6 xl:gap-8">
        <StickyRailAd
          slotKey="sidebar"
          sticky={false}
          label="Sponsored left"
        />

        <div className="min-w-0 w-full max-w-3xl xl:max-w-4xl">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="v2-eyebrow mb-2 inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <Radio className="h-3.5 w-3.5" />
                {t(dict, "news.subtitle")}
              </p>
              <h1 className="font-display flex flex-nowrap items-center gap-2.5 text-3xl font-bold tracking-tight md:text-4xl">
                <span
                  className="relative inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 live-news-dot"
                  aria-hidden
                />
                <span className="whitespace-nowrap text-foreground">
                  {t(dict, "news.title")}
                </span>
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {tf(
                dict,
                "news.statsLine",
                {
                  n: desk.total,
                  stories:
                    desk.total === 1
                      ? t(dict, "news.story")
                      : t(dict, "news.stories"),
                },
                `${desk.total} stories · last 30 days · every 30 min`
              )}
            </p>
          </div>

          <NewsDeskClient desk={desk} />
        </div>

        <StickyRailAd slotKey="hub" sticky label="Sponsored right" />
      </div>
    </div>
  );
}
