import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { ContentVerseAiHub } from "@/components/ai/contentverse-ai-hub";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { BandAd } from "@/components/ads/band-ad";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { PageBack } from "@/components/site/page-back";
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
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { buildLocaleHubMetadata } from "@/lib/i18n/locale-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocaleHubMetadata({
    path: CV_AI_PATH,
    titleKey: "hubs.aiTitle",
    titleEn: "ContentVerse India AI",
    titleHi: "ContentVerse India AI",
    descriptionKey: "hubs.aiSub",
    descriptionEn:
      "Ask, summarise, explain, compare, resume, finance and OCR tools.",
    descriptionHi:
      "Ask, summarise, explain, compare, resume, finance and OCR tools.",
    keywords: [...CV_AI_KEYWORDS],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600",
    noIndex: true,
  });
}

export default async function ContentVerseAiPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
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

      <PageBack href="/" label={t(dict, "common.home")} />

      <header className="space-y-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-300">
          <Sparkles className="h-3.5 w-3.5" />
          {t(dict, "hubs.aiTitle")}
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-5xl">
          {t(dict, "hubs.aiHeading")}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          {t(dict, "hubs.aiBody")}
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

      <BandAd slotKey="horizontal" />

      <Suspense
        fallback={
          <div className="rounded-3xl border border-border/50 bg-muted/10 p-10 text-sm text-muted-foreground">
            Loading ContentVerse India AI…
          </div>
        }
      >
        <ContentVerseAiHub />
      </Suspense>

      <HubAdSense />
      <RelatedHubs current="ai" />
    </div>
  );
}
