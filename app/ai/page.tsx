import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { ContentVerseAiHub } from "@/components/ai/contentverse-ai-hub";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { RelatedHubs } from "@/components/seo/related-hubs";
import {
  CV_AI_KEYWORDS,
  CV_AI_PATH,
} from "@/lib/ai/cv-ai-modes";
import {
  cvAiBreadcrumbJsonLd,
  cvAiFaqJsonLd,
  cvAiWebPageJsonLd,
} from "@/lib/ai/cv-ai-seo";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "ContentVerse India AI — Ask, Summarise, Resume, Bank PDF & Screenshot OCR",
  description:
    "ContentVerse India AI for India: ask anything, summarise articles, explain simply, compare options, generate job resumes, calculate finance, analyse PDF text, bank statements and UPI screenshots.",
  path: CV_AI_PATH,
  keywords: [...CV_AI_KEYWORDS],
  image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600",
});

export default function ContentVerseAiPage() {
  const blocks = [cvAiWebPageJsonLd(), cvAiFaqJsonLd(), cvAiBreadcrumbJsonLd()];

  return (
    <div className="container max-w-5xl space-y-8 py-8 md:py-10">
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <header className="space-y-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-300">
          <Sparkles className="h-3.5 w-3.5" />
          ContentVerse India AI
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-5xl">
          Your AI product for India — not just a chatbot
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          Ask anything, summarise articles, explain topics simply, compare choices, draft
          resumes, calculate finance, analyse PDFs, bank statements and payment screenshots —
          wired into MoneyVerse and India Tools.
        </p>
      </header>

      <HubEditorialIntro title="AI modes wired into MoneyVerse & Tools">
        <p>
          ContentVerse India AI is the product layer on top of our live tools. Chat modes help you
          think and draft; upload tools like Bank Statement Analyzer return structured money
          insights — total income, expense, top category, monthly average and subscription
          detection.
        </p>
        <p>
          Jump to{" "}
          <Link href="/moneyverse/bank-statement-analyzer" className="text-primary hover:underline">
            bank statement analyzer
          </Link>
          ,{" "}
          <Link href="/moneyverse/screenshot-scan" className="text-primary hover:underline">
            screenshot OCR
          </Link>
          ,{" "}
          <Link href="/tools" className="text-primary hover:underline">
            India Tools
          </Link>
          , or{" "}
          <Link href="/ai?mode=resume" className="text-primary hover:underline">
            resume mode
          </Link>{" "}
          for jobs.
        </p>
      </HubEditorialIntro>

      <Suspense
        fallback={
          <div className="rounded-3xl border border-border/50 bg-muted/10 p-10 text-sm text-muted-foreground">
            Loading ContentVerse India AI…
          </div>
        }
      >
        <ContentVerseAiHub />
      </Suspense>

      <RelatedHubs current="ai" />
    </div>
  );
}
