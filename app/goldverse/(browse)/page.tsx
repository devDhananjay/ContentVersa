import type { Metadata } from "next";
import Link from "next/link";
import { FakeGoldChecklist } from "@/components/goldverse/fake-gold-checklist";
import { HallmarkGuide } from "@/components/goldverse/hallmark-guide";
import { HuidVerifyPanel } from "@/components/goldverse/huid-verify-panel";
import { GoldVerseToolsStrip } from "@/components/goldverse/goldverse-tools-strip";
import { BandAd } from "@/components/ads/band-ad";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { GOLDVERSE_HUB_SEO, hubSeoJsonLdBlocks } from "@/lib/seo/hub-seo";
import { HUID_SEO_KEYWORDS, HUID_VERIFICATION_PATH } from "@/lib/goldverse/huid-seo";
import { buildMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "GoldVerse — HUID Verification, Gold Price & BIS Hallmark India",
  description:
    "Verify BIS HUID on gold jewellery online, check gold rate context for India, spot fake gold risks and learn BIS hallmark rules on ContentVerse India GoldVerse.",
  path: "/goldverse",
  keywords: [
    "gold price today India",
    "gold rate today",
    "22k gold rate",
    "24k gold price",
    "BIS hallmark India",
    "HUID verification",
    "verify HUID online",
    "hallmark unique ID",
    "fake gold checklist",
    "gold jewellery India",
    "BIS HUID check",
    "GoldVerse",
    ...HUID_SEO_KEYWORDS.slice(0, 4),
  ],
  image:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600",
});

export default async function GoldVersePage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-10">
      <HubJsonLd blocks={hubSeoJsonLdBlocks(GOLDVERSE_HUB_SEO)} />
      <HubEditorialIntro title={t(dict, "hubs.goldEditorialTitle")}>
        <p>{t(dict, "hubs.goldEditorialBody")}</p>
        <p>
          Use{" "}
          <Link href={HUID_VERIFICATION_PATH} className="font-medium text-amber-400 hover:underline">
            HUID verification online
          </Link>
          , read{" "}
          <Link href="/guides/money/huid-hallmark-gold-buying-india" className="font-medium text-amber-400 hover:underline">
            gold buying & HUID checklist
          </Link>
          , or check{" "}
          <Link href="/tools/silver-rate" className="font-medium text-amber-400 hover:underline">
            silver rate
          </Link>
          . Sign in for <strong>3 free BIS HUID checks</strong> per account.
        </p>
      </HubEditorialIntro>

      <HuidVerifyPanel />

      <FakeGoldChecklist />

      <GoldVerseToolsStrip />

      <HallmarkGuide />
      {/* After educational hallmark guide — never beside HUID verify form */}
      <BandAd slotKey="horizontal" />
      <HubAdSense />
      <RelatedHubs current="goldverse" contained />
    </div>
  );
}
