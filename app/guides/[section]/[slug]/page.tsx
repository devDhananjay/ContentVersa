import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildLocaleHubMetadata } from "@/lib/i18n/locale-metadata";
import { buildMetadata } from "@/lib/seo";
import {
  GUIDE_ARTICLES,
  GUIDES_HUB_PATH,
  getGuideArticle,
  getGuideSection,
  guideSectionPath,
} from "@/lib/guides/registry";
import { guideArticleJsonLd } from "@/lib/guides/guides-seo";
import { AdSlot } from "@/components/ads/ad-slot";
import { GoogleAdSense } from "@/components/ads/google-adsense";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { StickyRailAd } from "@/components/ads/sticky-rail-ad";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { getTopicCluster } from "@/lib/seo/topic-clusters";
import { TopicClusterLinks } from "@/components/seo/topic-cluster-links";
import { YmylDisclaimer } from "@/components/seo/ymyl-disclaimer";
import { PageTrail } from "@/components/site/page-back";

type Props = { params: Promise<{ section: string; slug: string }> };

export function generateStaticParams() {
  return GUIDE_ARTICLES.map((a) => ({
    section: a.section,
    slug: a.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, slug } = await params;
  const article = getGuideArticle(section, slug);
  if (!article) return buildMetadata({ title: "Guide", noIndex: true });
  return buildLocaleHubMetadata({
    path: `${GUIDES_HUB_PATH}/${article.section}/${article.slug}`,
    titleEn: article.title,
    titleHi: article.title,
    descriptionEn: article.description,
    descriptionHi: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedLabel,
    bilingualIndex: false,
  });
}

export default async function GuideArticlePage({ params }: Props) {
  const { section: sectionSlug, slug } = await params;
  const article = getGuideArticle(sectionSlug, slug);
  const section = getGuideSection(sectionSlug);
  if (!article || !section) notFound();

  const jsonLd = guideArticleJsonLd(article, section);
  const cluster = article.clusterId
    ? getTopicCluster(article.clusterId)
    : article.section === "schemes"
      ? getTopicCluster("govt-schemes")
      : undefined;

  const showYmyl =
    article.section === "schemes" ||
    article.section === "money" ||
    article.clusterId === "salary-tax" ||
    article.clusterId === "gst-business" ||
    article.clusterId === "sip-investing" ||
    article.clusterId === "emi-loans" ||
    article.clusterId === "jobs";

  const ymylKind =
    article.slug === "ayushman-bharat-pmjay-eligibility" ||
    article.slug === "health-insurance-india-beginners"
      ? "health"
      : article.clusterId === "salary-tax" ||
          article.clusterId === "gst-business" ||
          article.slug.includes("tax-regime")
        ? "tax"
        : article.section === "money"
          ? "finance"
          : "schemes";

  return (
    <article className="container py-8 md:py-10">
      {Array.isArray(jsonLd) ? (
        jsonLd.map((block, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
          />
        ))
      ) : (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Body + one right sticky rail (TOI article money column) */}
      <div className="flex items-start justify-center gap-6 lg:gap-8">
        <div className="min-w-0 w-full max-w-3xl space-y-8">
          <PageTrail
            back={{
              href: guideSectionPath(section.slug),
              label: section.shortTitle,
            }}
            crumbs={[
              { href: GUIDES_HUB_PATH, label: "India Guides" },
              {
                href: guideSectionPath(section.slug),
                label: section.shortTitle,
              },
              { label: article.shortTitle },
            ]}
          />

          <header className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="neon">{section.badge}</Badge>
              <Badge variant="secondary">{article.readingMinutes} min read</Badge>
              <span className="text-xs text-muted-foreground self-center">
                Updated {article.updatedLabel}
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              {article.title}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {article.description}
            </p>
          </header>

          {/* ATF — compact MREC after title */}
          <AdSlot className="my-0" variant="mrec">
            <GoogleAdSense slotKey="horizontal" width={300} height={250} />
          </AdSlot>

          {showYmyl ? (
            <YmylDisclaimer kind={ymylKind} reviewedLabel={article.updatedLabel} />
          ) : null}

          <div className="space-y-8">
            {article.blocks.map((block, i) => (
              <section key={block.heading} className="space-y-3">
                <h2 className="font-display text-xl font-bold tracking-tight">
                  {block.heading}
                </h2>
                {block.paragraphs.map((p) => (
                  <p
                    key={p.slice(0, 40)}
                    className="text-muted-foreground leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
                {block.bullets?.length ? (
                  <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                    {block.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
                {block.table?.headers?.length && block.table.rows?.length ? (
                  <div className="overflow-x-auto rounded-xl border border-border/60">
                    {block.table.caption ? (
                      <p className="border-b border-border/50 bg-muted/30 px-3 py-2 text-xs font-medium text-foreground">
                        {block.table.caption}
                      </p>
                    ) : null}
                    <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/20">
                          {block.table.headers.map((h) => (
                            <th
                              key={h}
                              scope="col"
                              className="px-3 py-2.5 font-semibold text-foreground"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.table.rows.map((row, ri) => (
                          <tr
                            key={`${block.heading}-r${ri}`}
                            className="border-b border-border/40 last:border-0"
                          >
                            {row.map((cell, ci) => (
                              <td
                                key={`${ri}-${ci}`}
                                className={
                                  ci === 0
                                    ? "px-3 py-2.5 font-medium text-foreground/90"
                                    : "px-3 py-2.5 text-muted-foreground"
                                }
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {/* Mid-guide after first section */}
                {i === 0 && article.blocks.length > 1 ? (
                  <HubAdSense className="!px-0" />
                ) : null}
              </section>
            ))}
          </div>

          {article.sources?.length ? (
            <aside className="rounded-2xl border border-border/60 bg-card/40 p-4 text-sm">
              <p className="font-semibold text-foreground">Sources & official links</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Updated {article.updatedLabel}. Always re-check live rules on the primary portal.
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
                {article.sources.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}

          {article.faqs?.length ? (
            <section className="space-y-4">
              <h2 className="font-display text-xl font-bold tracking-tight">
                Frequently asked questions
              </h2>
              <div className="space-y-3">
                {article.faqs.map((item) => (
                  <Card key={item.q}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{item.q}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          {/* End unit before related links */}
          <HubAdSense className="!px-0" />

          {(article.relatedHref || section.relatedHub) && (
            <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
              <p className="text-sm font-semibold">Continue</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {article.relatedHref ? (
                  <Link href={article.relatedHref}>
                    <Button size="sm" className="gap-2">
                      {article.relatedLabel || "Related hub"}{" "}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : null}
                {section.relatedHub ? (
                  <Link href={section.relatedHub.href}>
                    <Button size="sm" variant="outline" className="gap-2">
                      {section.relatedHub.label} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : null}
                <Link href={guideSectionPath(section.slug)}>
                  <Button size="sm" variant="ghost">
                    More {section.shortTitle} guides
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {cluster ? (
            <TopicClusterLinks
              cluster={cluster}
              currentHref={`${GUIDES_HUB_PATH}/${article.section}/${article.slug}`}
            />
          ) : null}

          <p className="text-xs text-muted-foreground">
            Educational guide only. For government schemes, tax, and banking decisions,
            confirm details on official portals or with qualified professionals.
          </p>
        </div>

        <StickyRailAd slotKey="sidebar" label="Sponsored beside guide" />
      </div>
    </article>
  );
}
