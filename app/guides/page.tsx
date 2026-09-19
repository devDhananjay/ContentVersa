import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { GUIDES_HUB_PATH } from "@/lib/guides/registry";
import { guidesHubJsonLd, top30GuidesItemListJsonLd } from "@/lib/guides/guides-seo";
import { GuidesSectionGrid, TopThirtyGuidesGrid } from "@/components/guides/guides-ui";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { TopicClustersHubStrip } from "@/components/seo/topic-cluster-links";
import { YmylDisclaimer } from "@/components/seo/ymyl-disclaimer";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { Badge } from "@/components/ui/badge";
import {
  GUIDES_HUB_FAQS,
  hubBreadcrumbJsonLd,
  hubFaqJsonLd,
} from "@/lib/seo/hub-seo";

export const dynamic = "force-static";

export const metadata: Metadata = buildMetadata({
  title: "India Guides — Trending, Govt Schemes, Money, Jobs, Cricket, AI & Movies",
  description:
    "Free India explainers built for search: 30 high-intent topics — FASTag, EMI, SIP, tax, CIBIL, UPI fraud, PPF, schemes, jobs — plus cricket, AI, and OTT watch guides.",
  path: GUIDES_HUB_PATH,
  keywords: [
    "india guides",
    "fastag guide india",
    "emi calculator guide",
    "sip beginners india",
    "cibil score india",
    "upi fraud india",
    "ppf account rules",
    "ifsc code guide",
    "govt schemes eligibility",
    "why is it trending",
    "sarkari job notification",
    "ContentVerse India guides",
  ],
});

export default function GuidesHubPage() {
  const blocks = [
    guidesHubJsonLd(),
    top30GuidesItemListJsonLd(),
    hubFaqJsonLd(GUIDES_HUB_FAQS),
    hubBreadcrumbJsonLd("India Guides", GUIDES_HUB_PATH),
  ];

  return (
    <div className="container space-y-10 py-8 md:py-10">
      <HubJsonLd blocks={blocks} />

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
          Thirty high-intent topic pages sit on top of six formats — trending,
          cricket, schemes, jobs, AI, movies, and money. Each pillar uses H2s,
          FAQs, and links to live tools.
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

      <TopThirtyGuidesGrid />

      <TopicClustersHubStrip
        title="Topic clusters"
        subtitle="Start from a pillar page, then move between guides, tools, and related reading."
      />

      <YmylDisclaimer kind="schemes" />

      <HubEditorialIntro title="Why these guide formats?">
        <p>
          Indian readers keep asking the same practical questions: why a topic
          is spiking, who qualifies for a scheme, when a job closes, what
          happened in a match, how to use an AI tool, and where to watch a film.
          ContentVerse India Guides answers those with finished explainers —
          one strong page per topic.
        </p>
        <p>
          Scheme and job pages are educational only. Always verify fees,
          eligibility, and forms on official government websites before you
          apply or pay anyone.
        </p>
      </HubEditorialIntro>

      <RelatedHubs current="guides" />
    </div>
  );
}
