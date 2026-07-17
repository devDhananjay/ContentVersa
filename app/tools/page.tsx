import type { Metadata } from "next";
import { ToolsHubGrid, ToolsHubIntro } from "@/components/tools/tools-hub-grid";
import { buildMetadata } from "@/lib/seo";
import { TOOLS_HUB_PATH } from "@/lib/tools/registry";
import { toolsHubJsonLd } from "@/lib/tools/tools-seo";

export const dynamic = "force-static";

export const metadata: Metadata = buildMetadata({
  title: "Free India Utility Tools — Weather, IFSC, Pincode, QR & More",
  description:
    "Free daily-use tools for India — weather, currency converter, QR & barcode generator, FSSAI format check, holidays, nearby hotels & hospitals, IFSC, pincode, RTO, EMI, SIP, and fuel prices.",
  path: TOOLS_HUB_PATH,
  keywords: [
    "india utility tools",
    "weather india",
    "qr code generator",
    "nearby places india",
    "ifsc finder",
    "pincode search",
    "emi calculator india",
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
