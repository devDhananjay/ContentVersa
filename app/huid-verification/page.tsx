import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { HuidVerificationGuide } from "@/components/goldverse/huid-verification-guide";
import { HuidVerifyPanel } from "@/components/goldverse/huid-verify-panel";
import { BandAd } from "@/components/ads/band-ad";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { HuidVerificationJsonLd } from "@/components/seo/huid-verification-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { PageBack } from "@/components/site/page-back";
import { HUID_SEO_KEYWORDS, HUID_VERIFICATION_PATH } from "@/lib/goldverse/huid-seo";
import { buildMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-static";

export const metadata: Metadata = buildMetadata({
  title: "HUID Verification Online — Verify BIS Gold Hallmark India",
  description:
    "Free online HUID verification for gold jewellery in India. Check BIS Hallmark Unique ID — verify purity, jeweller, weight and marking date. 3 free checks per account.",
  path: HUID_VERIFICATION_PATH,
  keywords: [...HUID_SEO_KEYWORDS],
  image:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600",
});

export default async function HuidVerificationPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <div className="container space-y-10 py-8 md:py-10">
      <HuidVerificationJsonLd />

      <PageBack href="/" label={t(dict, "common.home")} />

      <header className="max-w-3xl space-y-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          {t(dict, "hubs.huidBadge")}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {t(dict, "hubs.huidTitle")}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base leading-relaxed">
          {t(dict, "hubs.huidSub")}
        </p>
        <p className="text-xs text-muted-foreground">
          Part of{" "}
          <Link href="/goldverse" className="text-amber-400 hover:underline">
            ContentVerse India GoldVerse
          </Link>
          — gold rates, hallmark guide and buyer tools. Also see{" "}
          <Link href="/guides/money/huid-hallmark-gold-buying-india" className="text-amber-400 hover:underline">
            gold buying & HUID checklist
          </Link>
          .
        </p>
      </header>

      <HuidVerifyPanel signInNext={`${HUID_VERIFICATION_PATH}#huid-verify`} />

      <HuidVerificationGuide />

      <BandAd slotKey="horizontal" />
      <HubAdSense />
      <RelatedHubs current="goldverse" />
    </div>
  );
}
