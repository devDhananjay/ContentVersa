import type { Metadata } from "next";
import Link from "next/link";
import { ToolsHubGrid, ToolsHubIntro } from "@/components/tools/tools-hub-grid";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import {
  hubBreadcrumbJsonLd,
  hubFaqJsonLd,
  TOOLS_HUB_FAQS,
} from "@/lib/seo/hub-seo";
import { buildMetadata } from "@/lib/seo";
import { TOOLS_HUB_PATH } from "@/lib/tools/registry";
import { toolsHubJsonLd } from "@/lib/tools/tools-seo";

export const dynamic = "force-static";

export const metadata: Metadata = buildMetadata({
  title: "Free India Utility Tools — Weather, Tax, PDF, IFSC & More",
  description:
    "Free daily-use tools for India — salary & income tax calculator, weather, currency converter, QR & barcode, merge/split/compress PDF, PNR status, Hindi translator, IFSC, pincode, RTO, EMI, SIP, FD, GST and fuel prices.",
  path: TOOLS_HUB_PATH,
  keywords: [
    "india utility tools",
    "income tax calculator india",
    "salary calculator",
    "merge pdf free",
    "weather india",
    "qr code generator",
    "PNR status check",
    "english hindi translator",
    "IFSC finder",
    "EMI calculator india",
    "FD calculator",
    "GST calculator",
    "silver rate today",
    "nearby places india",
  ],
});

export default function ToolsHubPage() {
  const blocks = [
    toolsHubJsonLd(),
    hubFaqJsonLd(TOOLS_HUB_FAQS),
    hubBreadcrumbJsonLd("India Tools", TOOLS_HUB_PATH),
  ];

  return (
    <div className="container space-y-10 py-8 md:py-10">
      <HubJsonLd blocks={blocks} />
      <ToolsHubIntro />
      <HubEditorialIntro title="Free calculators & utilities built for India">
        <p>
          ContentVerse India Tools covers everyday search intents — tax, PDF, travel,
          banking codes, EMI/SIP/FD maths, weather and nearby places — without signup for
          core utilities.
        </p>
        <p>
          Popular starts:{" "}
          <Link href="/tools/salary-tax-calculator" className="text-primary hover:underline">
            salary tax calculator
          </Link>
          ,{" "}
          <Link href="/tools/merge-pdf" className="text-primary hover:underline">
            merge PDF
          </Link>
          ,{" "}
          <Link href="/tools/pnr-status" className="text-primary hover:underline">
            PNR status
          </Link>
          ,{" "}
          <Link href="/tools/ifsc-finder" className="text-primary hover:underline">
            IFSC finder
          </Link>
          , plus{" "}
          <Link href="/moneyverse" className="text-primary hover:underline">
            MoneyVerse
          </Link>{" "}
          and{" "}
          <Link href="/ai" className="text-primary hover:underline">
            ContentVerse India AI
          </Link>
          .
        </p>
      </HubEditorialIntro>
      <HubAdSense className="my-2" />
      <ToolsHubGrid />
      <section className="max-w-3xl rounded-xl border border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Official government portals</p>
        <p className="mt-2">
          For live vehicle RC, challan, or DL records use official MoRTH services:{" "}
          <a
            href="https://vahan.parivahan.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Vahan
          </a>
          ,{" "}
          <a
            href="https://echallan.parivahan.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            e-Challan
          </a>
          , and{" "}
          <a
            href="https://parivahan.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Parivahan Sewa
          </a>
          . ContentVerse India tools use free public data and format checks only.
        </p>
      </section>

      <RelatedHubs current="tools" />
    </div>
  );
}
