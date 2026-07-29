import type { Metadata } from "next";
import Link from "next/link";
import { Flame, ExternalLink, ArrowRight } from "lucide-react";
import { buildMetadata, SITE } from "@/lib/seo";
import {
  fetchIndiaTrends,
  getTrendBySlug,
  summarizeTrend,
  titleFromSlug,
  trendPath,
} from "@/lib/trending/google-trends";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { Badge } from "@/components/ui/badge";
import { AskAboutTrend } from "@/components/trending/ask-about-trend";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trend = await getTrendBySlug(slug);
  const title = trend?.title || titleFromSlug(slug);
  return buildMetadata({
    title: `${title} — Trending in India`,
    description: `Why "${title}" is trending in India today. Short briefing, related headlines, and ask ContentVerse chat — stay on site.`,
    path: trendPath(slug),
    keywords: [
      title,
      "Google Trends India",
      "trending India today",
      "why trending",
    ],
    type: "article",
  });
}

export default async function TrendingTopicPage({ params }: Props) {
  const { slug } = await params;
  const trend = await getTrendBySlug(slug);
  const title = trend?.title || titleFromSlug(slug);
  const traffic = trend?.traffic || "";
  const newsItems = trend?.newsItems || [];

  const { summary, source } = await summarizeTrend({
    title,
    traffic,
    newsItems,
  });

  const others = (await fetchIndiaTrends())
    .filter((t) => t.slug !== slug)
    .slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: `${title} — Trending in India`,
    description: summary.slice(0, 160),
    datePublished: trend?.publishedAt
      ? new Date(trend.publishedAt).toISOString()
      : new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: { "@type": "ImageObject", url: `${SITE.url}/icon-192.png` },
    },
    mainEntityOfPage: `${SITE.url}${trendPath(slug)}`,
    image: trend?.picture ? [trend.picture] : undefined,
  };

  return (
    <article className="container max-w-3xl space-y-8 py-8 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/trending" className="hover:text-foreground">
          Trending
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground line-clamp-1">{title}</span>
      </nav>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neon" className="gap-1">
            <Flame className="h-3 w-3" />
            Google Trends · India
          </Badge>
          {traffic ? (
            <Badge variant="secondary">{traffic} searches</Badge>
          ) : null}
          {!trend ? (
            <Badge variant="outline">May have cooled off</Badge>
          ) : null}
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Briefing on ContentVerse — read here, ask follow-ups in chat, no need
          to leave for Google Search.
        </p>
        <AskAboutTrend title={title} />
      </header>

      {trend?.picture ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border/50 bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trend.picture}
            alt=""
            className="h-full w-full object-cover"
          />
          {trend.pictureSource ? (
            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
              {trend.pictureSource}
            </span>
          ) : null}
        </div>
      ) : null}

      <HubAdSense className="my-2" />

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Why it&apos;s trending
          </h2>
          <span className="text-[11px] text-muted-foreground">
            {source === "gemini" ? "AI briefing" : "Quick briefing"}
          </span>
        </div>
        <div className="space-y-3 text-muted-foreground leading-relaxed whitespace-pre-line">
          {summary}
        </div>
      </section>

      {newsItems.length ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Related headlines
          </h2>
          <ul className="space-y-3">
            {newsItems.map((n) => (
              <li key={n.url}>
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-xl border border-border/50 bg-card/60 p-4 transition hover:border-orange-400/40"
                >
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug group-hover:text-orange-300">
                      {n.title}
                    </p>
                    {n.source ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {n.source}
                      </p>
                    ) : null}
                  </div>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Headlines open on publisher sites. The briefing above stays on
            ContentVerse for reading + chat.
          </p>
        </section>
      ) : null}

      <HubAdSense className="my-2" />

      <section className="rounded-2xl border border-border/50 bg-gradient-to-br from-orange-500/10 to-pink-500/5 p-5 space-y-3">
        <h2 className="font-display text-lg font-bold">Have a doubt?</h2>
        <p className="text-sm text-muted-foreground">
          Open ContentVerse chat and ask anything about this topic — in English
          or Hindi.
        </p>
        <AskAboutTrend title={title} />
      </section>

      {others.length ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold tracking-tight">
            More trending now
          </h2>
          <div className="flex flex-wrap gap-2">
            {others.map((t) => (
              <Link
                key={t.slug}
                href={t.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5 text-xs font-semibold transition hover:border-orange-400/50"
              >
                {t.title}
                {t.traffic ? (
                  <span className="text-muted-foreground">{t.traffic}</span>
                ) : null}
              </Link>
            ))}
          </div>
          <Link
            href="/trending"
            className="inline-flex items-center gap-1 text-sm font-medium text-orange-300 hover:underline"
          >
            All India trends
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      ) : null}
    </article>
  );
}
