import type { Metadata } from "next";
import { Radio } from "lucide-react";
import { StickyRailAd } from "@/components/ads/sticky-rail-ad";
import { NewsDeskClient } from "@/components/news/news-desk-client";
import { getNewsDesk } from "@/lib/data/live-news";
import { buildMetadata, SITE } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Live News — India desk briefings | ContentVerse India",
  description:
    "Live India news briefings rewritten for ContentVerse readers — politics, business, sports and top stories, updated through the day.",
  path: "/news",
  keywords: [
    "India live news",
    "ContentVerse news",
    "India headlines",
    "news briefings India",
  ],
});

export default async function NewsHubPage() {
  const items = await getNewsDesk(24);
  const briefings = items.filter((i) => i.hasBriefing);

  const listJsonLd =
    briefings.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Live News — ContentVerse India",
          description:
            "India desk news briefings updated through the day on ContentVerse India.",
          url: `${SITE.url}/news`,
          isPartOf: { "@id": `${SITE.url}/#website` },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: briefings.slice(0, 20).map((b, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: b.href.startsWith("http")
                ? b.href
                : `${SITE.url}${b.href}`,
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
                India desk
              </p>
              <h1 className="font-display flex flex-nowrap items-center gap-2.5 text-3xl font-bold tracking-tight md:text-4xl">
                <span
                  className="relative inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 live-news-dot"
                  aria-hidden
                />
                <span className="whitespace-nowrap">
                  <span className="live-news-title-blink text-red-600 dark:text-red-400">
                    Live
                  </span>{" "}
                  <span className="text-foreground">News</span>
                </span>
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {briefings.length} briefing{briefings.length === 1 ? "" : "s"} · every
              30 min
            </p>
          </div>

          <NewsDeskClient items={items} />
        </div>

        <StickyRailAd slotKey="hub" sticky label="Sponsored right" />
      </div>
    </div>
  );
}
