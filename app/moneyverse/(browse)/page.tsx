import type { Metadata } from "next";
import Link from "next/link";
import { MoneyVerseHub } from "@/components/moneyverse/moneyverse-hub";
import { MoneyTopicsGrid } from "@/components/finance/money-topics-grid";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { hubSeoJsonLdBlocks, MONEYVERSE_HUB_SEO } from "@/lib/seo/hub-seo";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "MoneyVerse — Expense Tracker, Budget Planner & Screenshot OCR India",
  description: MONEYVERSE_HUB_SEO.description,
  path: "/moneyverse",
  keywords: [
    "expense tracker India",
    "UPI expense manager",
    "budget planner India",
    "monthly expense report",
    "credit card reminder",
    "SIP reminder",
    "UPI screenshot OCR",
    "payment screenshot scan",
    "bank statement analyzer",
    "PhonePe expense tracker",
    "GPay screenshot OCR",
    "MoneyVerse",
    "personal finance app India",
  ],
  image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1600",
});

export default function MoneyVersePage() {
  return (
    <div className="space-y-8">
      <HubJsonLd blocks={hubSeoJsonLdBlocks(MONEYVERSE_HUB_SEO)} />
      <HubEditorialIntro title="Track spends, budgets & UPI screenshots">
        <p>
          MoneyVerse is your personal finance hub for everyday Indian spending — log UPI,
          cash and card expenses, set category budgets, and see where your money goes each
          month.
        </p>
        <p>
          Use{" "}
          <Link href="/moneyverse/screenshot-scan" className="text-emerald-300 hover:underline">
            Screenshot Scan (OCR)
          </Link>{" "}
          and{" "}
          <Link
            href="/moneyverse/bank-statement-analyzer"
            className="text-emerald-300 hover:underline"
          >
            Bank Statement Analyzer
          </Link>
          , or explore{" "}
          <Link href="/finance#money-guides" className="text-emerald-300 hover:underline">
            MoneyVerse guides
          </Link>{" "}
          and{" "}
          <Link href="/ai" className="text-emerald-300 hover:underline">
            ContentVerse India AI
          </Link>
          .
        </p>
      </HubEditorialIntro>
      <MoneyVerseHub />
      <MoneyTopicsGrid title="Strengthen your money knowledge" />
      <RelatedHubs current="moneyverse" contained />
    </div>
  );
}
