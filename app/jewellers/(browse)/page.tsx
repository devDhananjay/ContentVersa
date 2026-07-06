import type { Metadata } from "next";
import Link from "next/link";
import { FakeGoldChecklist } from "@/components/jewellers/fake-gold-checklist";
import { HallmarkGuide } from "@/components/jewellers/hallmark-guide";
import { HuidVerifyPanel } from "@/components/jewellers/huid-verify-panel";
import { JewellersToolsStrip } from "@/components/jewellers/jewellers-tools-strip";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HUID_SEO_KEYWORDS, HUID_VERIFICATION_PATH } from "@/lib/jewellers/huid-seo";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "HUID Verification, Gold Price & BIS Hallmark — Jewellers Hub India",
  description:
    "Verify BIS HUID on gold jewellery online, check today's gold rates by city, spot fake gold and access hallmark tools — ContentVerse Jewellers Hub India.",
  path: "/jewellers",
  keywords: [...HUID_SEO_KEYWORDS, "gold price today India", "BIS hallmark guide"],
  image:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600",
});

export default function JewellersHubPage() {
  return (
    <div className="space-y-10">
      <HubEditorialIntro title="Jewellers Hub on ContentVerse">
        <p>
          ContentVerse Jewellers Hub helps buyers and jewellers verify gold hallmark
          authenticity using the official BIS HUID database, track gold prices across
          Indian cities, and access hallmark education and complaint tools.
        </p>
        <p>
          Use our dedicated{" "}
          <Link href={HUID_VERIFICATION_PATH} className="font-medium text-amber-400 hover:underline">
            HUID verification online
          </Link>{" "}
          tool to check any 6-character Hallmark Unique ID. Sign in for{" "}
          <strong>5 free BIS HUID checks</strong> per account. Jewellery businesses
          needing higher volume can contact us for API access.
        </p>
      </HubEditorialIntro>

      <HuidVerifyPanel />

      <FakeGoldChecklist />

      <JewellersToolsStrip />

      <HallmarkGuide />
    </div>
  );
}
