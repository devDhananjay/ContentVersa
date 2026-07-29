import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { GUIDES_HUB_PATH } from "@/lib/guides/registry";
import { guidesHubJsonLd } from "@/lib/guides/guides-seo";
import { GuidesSectionGrid } from "@/components/guides/guides-ui";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-static";

export const metadata: Metadata = buildMetadata({
  title: "India Guides — Trending, Govt Schemes, Jobs, Cricket, AI & Movies",
  description:
    "Free India explainers built for search: why topics trend, government scheme eligibility, sarkari job notifications, cricket match guides, AI how-tos, and OTT where-to-watch.",
  path: GUIDES_HUB_PATH,
  keywords: [
    "india guides",
    "govt schemes eligibility",
    "why is it trending",
    "sarkari job notification",
    "ott where to watch india",
  ],
});

export default function GuidesHubPage() {
  const jsonLd = guidesHubJsonLd();
  return (
    <div className="container space-y-10 py-8 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="max-w-3xl space-y-3">
        <Badge variant="neon" className="gap-1">
          <BookOpen className="h-3 w-3" />
          India Guides
        </Badge>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Guides built for how India{" "}
          <span className="text-gradient">searches</span>
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Six high-intent formats — trending explainers, cricket match moments,
          government schemes, job notifications, AI tool how-tos, and movie/OTT
          watch guides. Each section links to live hubs where useful.
        </p>
        <p className="text-sm text-muted-foreground">
          Also explore{" "}
          <Link href="/tools" className="text-primary underline-offset-2 hover:underline">
            India Tools
          </Link>
          ,{" "}
          <Link href="/jobs/govt" className="text-primary underline-offset-2 hover:underline">
            Govt Jobs
          </Link>
          , and{" "}
          <Link href="/sports" className="text-primary underline-offset-2 hover:underline">
            Sports
          </Link>
          .
        </p>
      </header>

      <HubAdSense className="my-2" />

      <GuidesSectionGrid />

      <HubEditorialIntro title="Why these guide formats?">
        <p>
          Indian search traffic clusters around a few repeating templates: “Why
          is X trending?”, scheme eligibility, job last dates, match updates, AI
          how-tos, and “where to watch”. ContentVerse Guides mirrors those
          templates so pages stay useful and easy to crawl.
        </p>
        <p>
          Scheme and job pages are educational only. Always verify fees,
          eligibility, and forms on official government websites before you
          apply or pay anyone.
        </p>
      </HubEditorialIntro>
    </div>
  );
}
