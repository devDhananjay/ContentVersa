import type { Metadata } from "next";
import Link from "next/link";
import { SarkariResultsHub } from "@/components/results/sarkari-results-hub";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sarkari Result — Official Exam & Board Results India",
  description:
    "Find official Sarkari Result links for SSC, UPSC, CBSE, IBPS, RRB, NTA, NEET, JEE and more. ContentVerse links only to government portals — no fake results.",
  path: "/results",
  keywords: [
    "sarkari result",
    "ssc result",
    "cbse result",
    "upsc result",
    "ibps result",
    "neet result",
    "jee main result",
    "railway result",
  ],
});

export default function ResultsPage() {
  return (
    <div className="container max-w-5xl space-y-8 py-8 md:py-10">
      <HubEditorialIntro title="Sarkari Result hub">
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
    </div>
  );
}
