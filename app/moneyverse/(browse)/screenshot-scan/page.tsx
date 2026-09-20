import type { Metadata } from "next";
import Link from "next/link";
import { ScanLine } from "lucide-react";
import { ScreenshotScanGuide } from "@/components/moneyverse/screenshot-scan-guide";
import { ScreenshotScanOcrTool } from "@/components/moneyverse/screenshot-scan-ocr-tool";
import { MoneyverseScreenshotScanJsonLd } from "@/components/seo/moneyverse-screenshot-scan-json-ld";
import {
  MONEYVERSE_SCREENSHOT_SCAN_PATH,
  SCREENSHOT_SCAN_EDITORIAL,
  SCREENSHOT_SCAN_OCR_KEYWORDS,
} from "@/lib/moneyverse/screenshot-scan-seo";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Screenshot Scan (OCR) — UPI Payment to Expense | MoneyVerse",
  description:
    "Learn when to use UPI screenshot OCR vs manual entry, then upload PhonePe, GPay or Paytm success screens to draft expenses in MoneyVerse. Free on ContentVerse India — review before you save.",
  path: MONEYVERSE_SCREENSHOT_SCAN_PATH,
  keywords: [...SCREENSHOT_SCAN_OCR_KEYWORDS],
  image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1600",
  // Keep noindex through AdSense review; flip after crawl quality settles.
  noIndex: true,
});

export default function ScreenshotScanOcrPage() {
  const { lead, paragraphs } = SCREENSHOT_SCAN_EDITORIAL;

  return (
    <div className="space-y-10">
      <MoneyverseScreenshotScanJsonLd />

      <header className="max-w-3xl space-y-4">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-300">
          <ScanLine className="h-3.5 w-3.5" />
          OCR · UPI · India
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Screenshot Scan (OCR) for UPI expenses
        </h1>
        <p className="text-sm text-muted-foreground md:text-base leading-relaxed">{lead}</p>
      </header>

      <article className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
        <p>
          Prefer a full bank month? Open the{" "}
          <Link
            href="/moneyverse/bank-statement-analyzer"
            className="text-violet-300 hover:underline"
          >
            Bank Statement Analyzer
          </Link>{" "}
          or return to your{" "}
          <Link href="/moneyverse" className="text-violet-300 hover:underline">
            MoneyVerse tracker
          </Link>
          .
        </p>
      </article>

      <section id="ocr-tool" className="space-y-3 scroll-mt-24">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Try the OCR upload
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Sign in, upload a clear payment success screenshot, then review every field before
          saving. Ads stay off on this MoneyVerse tool surface.
        </p>
        <ScreenshotScanOcrTool />
      </section>

      <ScreenshotScanGuide />
    </div>
  );
}
