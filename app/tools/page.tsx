import type { Metadata } from "next";
import { ToolsHubGrid, ToolsHubIntro } from "@/components/tools/tools-hub-grid";
import { buildMetadata } from "@/lib/seo";
import { TOOLS_HUB_PATH } from "@/lib/tools/registry";
import { toolsHubJsonLd } from "@/lib/tools/tools-seo";

export const dynamic = "force-static";

export const metadata: Metadata = buildMetadata({
  title: "Free India Utility Tools — IFSC, Pincode, RTO, EMI & More",
  description:
    "Free daily-use tools for India — IFSC bank lookup, pincode finder, RTO code search, vehicle plate decoder, PAN/GSTIN format check, EMI & SIP calculators, and petrol/diesel prices.",
  path: TOOLS_HUB_PATH,
  keywords: [
    "india utility tools",
    "ifsc finder",
    "pincode search",
    "rto code",
    "emi calculator india",
    "petrol price today",
  ],
});

export default function ToolsHubPage() {
  const jsonLd = toolsHubJsonLd();
  return (
    <div className="container space-y-10 py-8 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolsHubIntro />
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
          . ContentVerse tools use free public data and format checks only.
        </p>
      </section>
    </div>
  );
}
