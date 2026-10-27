import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildLocaleHubMetadata } from "@/lib/i18n/locale-metadata";
import { buildMetadata } from "@/lib/seo";
import { getDictionary, tf } from "@/lib/i18n/get-dictionary";
import {
  GUIDE_SECTIONS,
  GUIDES_HUB_PATH,
  getGuideSection,
} from "@/lib/guides/registry";
import { guideSectionFaq, guideSectionJsonLd } from "@/lib/guides/guides-seo";
import {
  GuideArticleList,
  GuideRelatedHub,
} from "@/components/guides/guides-ui";
import { BandAd } from "@/components/ads/band-ad";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { PageTrail } from "@/components/site/page-back";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ section: string }> };

export function generateStaticParams() {
  return GUIDE_SECTIONS.map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section: slug } = await params;
  const section = getGuideSection(slug);
  if (!section) return buildMetadata({ title: "Guide", noIndex: true });
  const enDict = getDictionary("en");
  const hiDict = getDictionary("hi");
  return buildLocaleHubMetadata({
    path: `${GUIDES_HUB_PATH}/${section.slug}`,
    titleEn: tf(enDict, "seo.guidesSectionTitle", { name: section.title }),
    titleHi: tf(hiDict, "seo.guidesSectionTitle", { name: section.title }),
    descriptionEn: section.description,
    descriptionHi: section.description,
    keywords: section.keywords,
  });
}

export default async function GuideSectionPage({ params }: Props) {
  const { section: slug } = await params;
  const section = getGuideSection(slug);
  if (!section) notFound();

  const faq = guideSectionFaq(section);
  const jsonLd = guideSectionJsonLd(section);

  return (
    <div className="container space-y-8 py-8 md:py-10">
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <PageTrail
        back={{ href: GUIDES_HUB_PATH, label: "India Guides" }}
        crumbs={[
          { href: GUIDES_HUB_PATH, label: "India Guides" },
          { label: section.shortTitle },
        ]}
      />

      <header className="max-w-3xl space-y-3">
        <Badge variant="neon">{section.badge}</Badge>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          {section.title}
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {section.description}
        </p>
      </header>

      <GuideRelatedHub section={section} />
      <GuideArticleList section={section} />

      <BandAd slotKey="horizontal" />

      <HubEditorialIntro title={`About ${section.shortTitle} guides`}>
        <p>
          Each page in this section is a finished explainer — eligibility, steps, or
          key facts — written so Indian search queries can be answered in one scan.
        </p>
      </HubEditorialIntro>

      <HubAdSense />

      <section className="max-w-3xl space-y-4">
        <h2 className="font-display text-xl font-bold">FAQ</h2>
        <div className="space-y-3">
          {faq.map((item) => (
            <details
              key={item.q}
              className="rounded-xl border border-border/60 bg-card/40 p-4"
            >
              <summary className="cursor-pointer font-medium">{item.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <RelatedHubs current="guides" />
    </div>
  );
}
