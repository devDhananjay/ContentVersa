import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import {
  GUIDE_ARTICLES,
  GUIDES_HUB_PATH,
  getGuideArticle,
  getGuideSection,
  guideSectionPath,
} from "@/lib/guides/registry";
import { guideArticleJsonLd } from "@/lib/guides/guides-seo";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { getTopicCluster } from "@/lib/seo/topic-clusters";
import { TopicClusterLinks } from "@/components/seo/topic-cluster-links";
import { YmylDisclaimer } from "@/components/seo/ymyl-disclaimer";

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
  return buildMetadata({
    title: article.title,
    description: article.description,
    path: `${GUIDES_HUB_PATH}/${article.section}/${article.slug}`,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedLabel,
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
    article.clusterId === "emi-loans";

  const ymylKind =
    article.slug === "ayushman-bharat-pmjay-eligibility"
      ? "health"
      : article.clusterId === "salary-tax" || article.clusterId === "gst-business"
        ? "tax"
        : article.section === "money"
          ? "finance"
          : "schemes";

  return (
    <article className="container max-w-3xl space-y-8 py-8 md:py-10">
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

      <nav className="text-sm text-muted-foreground">
        <Link href={GUIDES_HUB_PATH} className="hover:text-foreground">
          India Guides
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={guideSectionPath(section.slug)}
          className="hover:text-foreground"
        >
          {section.shortTitle}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{article.shortTitle}</span>
      </nav>

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

      <HubAdSense className="my-2" />

      {showYmyl ? <YmylDisclaimer kind={ymylKind} /> : null}

      <div className="space-y-8">
        {article.blocks.map((block) => (
          <section key={block.heading} className="space-y-3">
            <h2 className="font-display text-xl font-bold tracking-tight">
              {block.heading}
            </h2>
            {block.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="text-muted-foreground leading-relaxed">
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
          </section>
        ))}
      </div>

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
    </article>
  );
}
