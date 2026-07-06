import type { Metadata } from "next";
import Link from "next/link";
import { ScanLine } from "lucide-react";
import { ScreenshotScanGuide } from "@/components/moneyverse/screenshot-scan-guide";
import { ScreenshotScanOcrTool } from "@/components/moneyverse/screenshot-scan-ocr-tool";
import { MoneyverseScreenshotScanJsonLd } from "@/components/seo/moneyverse-screenshot-scan-json-ld";
import {
  MONEYVERSE_SCREENSHOT_SCAN_PATH,
  SCREENSHOT_SCAN_OCR_KEYWORDS,
} from "@/lib/moneyverse/screenshot-scan-seo";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Screenshot Scan (OCR) — UPI Payment to Expense | MoneyVerse",
  description:
    "Upload UPI or bank payment screenshots — OCR reads amount, merchant and category to auto-fill your expense tracker. PhonePe, GPay, Paytm screenshot scan free on ContentVerse India.",
  path: MONEYVERSE_SCREENSHOT_SCAN_PATH,
  keywords: [...SCREENSHOT_SCAN_OCR_KEYWORDS],
  image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1600",
});

export default function ScreenshotScanOcrPage() {
  return (
    <div className="space-y-10">
      <MoneyverseScreenshotScanJsonLd />

      <header className="max-w-3xl space-y-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-300">
          <ScanLine className="h-3.5 w-3.5" />
          OCR · UPI · India
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Screenshot Scan (OCR)
        </h1>
        <p className="text-sm text-muted-foreground md:text-base leading-relaxed">
          Upload a <strong className="text-foreground">UPI or payment screenshot</strong> —
          OCR scans the image and extracts amount, payee name, payment method and expense
          category. Review the pre-filled fields and save to your{" "}
          <Link href="/moneyverse" className="text-violet-300 hover:underline">
            MoneyVerse
          </Link>{" "}
          tracker in seconds.
        </p>
        <p className="text-xs text-muted-foreground">
          Works with PhonePe, Google Pay, Paytm, BHIM, bank apps and card payment
          confirmations.
        </p>
      </header>

      <ScreenshotScanOcrTool />
      <ScreenshotScanGuide />
    </div>
  );
}
