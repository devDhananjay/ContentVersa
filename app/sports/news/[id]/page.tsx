import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PageBack } from "@/components/site/page-back";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { getCricketNewsDetail } from "@/lib/sports/data";
import { buildMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { timeAgo } from "@/lib/utils";
import { BandAd } from "@/components/ads/band-ad";
import { MrecAd } from "@/components/ads/mrec-ad";
import { StickyRailAd } from "@/components/ads/sticky-rail-ad";
import { SHOW_THIRD_PARTY_CREDITS } from "@/lib/site/third-party-credits";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getCricketNewsDetail(Number(id));
  if (!article) return buildMetadata({ title: "Cricket News", noIndex: true });
  return buildMetadata({
    title: article.headline,
    description: article.intro,
    path: `/sports/news/${id}`,
    image: article.imageUrl,
    type: "article",
    publishedTime: article.publishedAt,
    noIndex: true,
  });
}

export default async function CricketNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const newsId = Number(id);
  if (!Number.isFinite(newsId)) redirect("/sports");

  const article = await getCricketNewsDetail(newsId);
  if (!article) redirect("/sports");

  const mid = Math.max(1, Math.floor(article.content.length / 2));
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <div className="container py-8 md:py-12">
      <div className="flex items-start justify-center gap-4 lg:gap-6 xl:gap-8">
        {/* Left long-height skyscraper */}
        <StickyRailAd
          slotKey="sidebar"
          sticky={false}
          label="Sponsored left"
        />

        <article className="min-w-0 w-full max-w-3xl">
          <PageBack
            href="/sports"
            label={t(dict, "hubs.sportsTitle")}
            className="mb-6"
          />

          {article.context && (
            <Badge variant="neon" className="mb-3">
              {article.context}
            </Badge>
          )}

          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            {article.headline}
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            {timeAgo(article.publishedAt)}
            {SHOW_THIRD_PARTY_CREDITS && article.source
              ? ` · ${article.source}`
              : ""}
          </p>

          {article.imageUrl && (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={article.imageUrl}
                alt={article.headline}
                fill
                priority
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <BandAd slotKey="horizontal" />

          <div className="prose prose-neutral dark:prose-invert max-w-none mt-8">
            {article.content.map((para, i) => (
              <div key={i}>
                <p className="text-base leading-relaxed text-foreground/90 mb-4">
                  {para}
                </p>
                {i === mid - 1 ? (
                  <div className="not-prose my-6 flex justify-center">
                    <MrecAd slotKey="inArticle" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <BandAd slotKey="hub" />

          <p className="mt-10 pt-6 border-t text-xs text-muted-foreground">
            {SHOW_THIRD_PARTY_CREDITS ? "Source: Cricbuzz via RapidAPI. " : ""}
            For editorial opinion and community discussion,{" "}
            <Link
              href="/category/sports"
              className="underline hover:text-foreground"
            >
              read sports blogs on ContentVerse India
            </Link>
            .
          </p>
        </article>

        {/* Right long-height skyscraper (sticky) */}
        <StickyRailAd slotKey="hub" sticky label="Sponsored right" />
      </div>
    </div>
  );
}
