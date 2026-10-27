"use client";

import Link from "next/link";
import type { ToolSlug } from "@/lib/tools/registry";
import { getToolBySlugOrThrow, toolFaq } from "@/lib/tools/tools-seo";
import { getToolGuide } from "@/lib/tools/tool-guides";
import { getTopicClusterForTool } from "@/lib/seo/topic-clusters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopicClusterLinks } from "@/components/seo/topic-cluster-links";
import { YmylDisclaimer } from "@/components/seo/ymyl-disclaimer";
import { BandAd } from "@/components/ads/band-ad";
import { MrecAd } from "@/components/ads/mrec-ad";
import { StickyRailAd } from "@/components/ads/sticky-rail-ad";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { PageBack } from "@/components/site/page-back";
import { useDictionary } from "@/components/i18n/use-dictionary";
import { tf } from "@/lib/i18n/get-dictionary";
import { ToolIcon } from "./tool-icon";

/**
 * Shared shell for all /tools/[slug] pages (37 tools).
 * Ads sit BELOW the interactive form — all formats: band, MREC, skyscraper.
 */
export function ToolPageShell({
  slug,
  children,
}: {
  slug: ToolSlug;
  children: React.ReactNode;
}) {
  const { dict, t } = useDictionary();
  const tool = getToolBySlugOrThrow(slug);
  const faq = toolFaq(tool);
  const guide = getToolGuide(slug);
  const cluster = getTopicClusterForTool(slug);
  const currentHref = `/tools/${slug}`;

  return (
    <div className="container space-y-10 py-8 md:py-10">
      <PageBack href="/tools" label={t("tools.indiaTools")} />

      <header className="max-w-3xl space-y-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <ToolIcon slug={slug} className="h-3.5 w-3.5" />
          {t("tools.indiaTools")}
          {tool.badge ? (
            <Badge variant="secondary" className="ml-1 text-[10px]">
              {tool.badge}
            </Badge>
          ) : null}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {tool.shortTitle}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base leading-relaxed">
          {tool.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("tools.partOf")}{" "}
          <Link href="/tools" className="text-primary hover:underline">
            ContentVerse {t("tools.indiaTools")}
          </Link>{" "}
          {t("tools.partOfSuffix")}
        </p>
      </header>

      {/* Calculators/forms only — no AdSense beside interactive inputs. */}
      {children}

      {/* Wide horizontal — after tool UI, before guide copy */}
      <BandAd slotKey="horizontal" />

      {guide?.ymylKind ? <YmylDisclaimer kind={guide.ymylKind} /> : null}

      {/* Editorial column + vertical rail (all sizes on every tool page) */}
      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 space-y-10">
          {guide ? (
            <section className="max-w-3xl space-y-6">
              <div className="space-y-3">
                <h2 className="font-display text-xl font-semibold">
                  {tf(dict, "tools.howToUse", { name: tool.shortTitle })}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                  {guide.intro}
                </p>
              </div>
              {guide.sections.map((section, i) => (
                <div key={section.heading} className="space-y-3">
                  <h3 className="font-display text-lg font-semibold">
                    {section.heading}
                  </h3>
                  {section.paragraphs.map((p) => (
                    <p
                      key={p.slice(0, 48)}
                      className="text-sm leading-relaxed text-muted-foreground md:text-base"
                    >
                      {p}
                    </p>
                  ))}
                  {section.bullets?.length ? (
                    <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                      {section.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                  {/* Mid-guide MREC after first section */}
                  {i === 0 && guide.sections.length > 1 ? (
                    <div className="flex justify-center py-2">
                      <MrecAd slotKey="inArticle" />
                    </div>
                  ) : null}
                </div>
              ))}
            </section>
          ) : (
            <div className="flex justify-center py-2">
              <MrecAd slotKey="inArticle" />
            </div>
          )}

          {guide?.examples?.length ? (
            <section className="max-w-3xl space-y-4">
              <h2 className="font-display text-xl font-semibold">
                {t("tools.workedExamples")}
              </h2>
              <div className="space-y-3">
                {guide.examples.map((ex) => (
                  <Card key={ex.title}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{ex.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed">
                      {ex.body}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          {/* Hub MREC between examples and FAQ */}
          <HubAdSense className="!px-0" />

          {guide?.relatedLinks?.length ? (
            <section className="max-w-3xl space-y-3">
              <h2 className="font-display text-xl font-semibold">
                {t("tools.relatedToolsHubs")}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {guide.relatedLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex rounded-full border px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {cluster ? (
            <TopicClusterLinks cluster={cluster} currentHref={currentHref} />
          ) : null}

          <section className="max-w-3xl space-y-4">
            <h2 className="font-display text-xl font-semibold">
              {t("tools.faq")}
            </h2>
            <div className="space-y-3">
              {faq.map((item) => (
                <Card key={item.q}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{item.q}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {item.a}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Vertical skyscraper — side format */}
        <StickyRailAd slotKey="sidebar" sticky label="Sponsored beside tool guide" />
      </div>

      {/* Closing wide band */}
      <BandAd slotKey="horizontal" />
    </div>
  );
}
