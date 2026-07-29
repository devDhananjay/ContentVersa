import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
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
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ section: string }> };

export function generateStaticParams() {
  return GUIDE_SECTIONS.map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section: slug } = await params;
  const section = getGuideSection(slug);
  if (!section) return buildMetadata({ title: "Guide", noIndex: true });
  return buildMetadata({
    title: section.title,
    description: section.description,
    path: `${GUIDES_HUB_PATH}/${section.slug}`,
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

      <nav className="text-sm text-muted-foreground">
        <Link href={GUIDES_HUB_PATH} className="hover:text-foreground">
          India Guides
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{section.shortTitle}</span>
      </nav>

      <header className="max-w-3xl space-y-3">
        <Badge variant="neon">{section.badge}</Badge>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          {section.title}
        </h1>
        <p className="text-sm font-medium text-primary">{section.template}</p>
        <p className="text-muted-foreground leading-relaxed">
          {section.description}
        </p>
      </header>

      <HubAdSense className="my-2" />
      <GuideRelatedHub section={section} />
      <GuideArticleList section={section} />

      <HubEditorialIntro title={`About ${section.shortTitle} guides`}>
        <p>
          Pages in this section follow the template{" "}
          <strong>{section.template}</strong>. That structure matches common
          India search queries and keeps answers scannable for readers and
          crawlers.
        </p>
      </HubEditorialIntro>

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
    </div>
  );
}
