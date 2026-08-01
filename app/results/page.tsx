import type { Metadata } from "next";
import Link from "next/link";
import { SarkariResultsHub } from "@/components/results/sarkari-results-hub";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { hubSeoJsonLdBlocks, RESULTS_HUB_SEO } from "@/lib/seo/hub-seo";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sarkari Result — Official Exam & Board Results India",
  description: RESULTS_HUB_SEO.description,
  path: "/results",
  keywords: [
    "sarkari result",
    "sarkari result 2026",
    "ssc result",
    "cbse result",
    "upsc result",
    "ibps result",
    "rrb result",
    "nta result",
    "neet result",
    "jee main result",
    "railway result",
    "board result India",
    "admit card result portal",
  ],
});

export default function ResultsPage() {
  return (
    <div className="container max-w-5xl space-y-8 py-8 md:py-10">
      <HubJsonLd blocks={hubSeoJsonLdBlocks(RESULTS_HUB_SEO)} />
      <HubEditorialIntro title="Official Sarkari Result portals only">
        <p>
          India searches for exam and board results every day. This hub collects{" "}
          <strong>official</strong> portals for central exams, boards, banking,
          railways and defence — so you open the right site without spam or fake
          marksheets.
        </p>
        <p>
          Also explore{" "}
          <Link href="/jobs/govt" className="text-primary hover:underline">
            government jobs
          </Link>
          ,{" "}
          <Link href="/guides/jobs" className="text-primary hover:underline">
            job guides
          </Link>
          , and{" "}
          <Link href="/tools" className="text-primary hover:underline">
            India tools
          </Link>
          .
        </p>
      </HubEditorialIntro>

      <HubAdSense />

      <SarkariResultsHub />

      <RelatedHubs current="results" />
    </div>
  );
}
