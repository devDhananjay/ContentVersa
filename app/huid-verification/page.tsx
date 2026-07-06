import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { HuidVerificationGuide } from "@/components/goldverse/huid-verification-guide";
import { HuidVerifyPanel } from "@/components/goldverse/huid-verify-panel";
import { HuidVerificationJsonLd } from "@/components/seo/huid-verification-json-ld";
import { HUID_SEO_KEYWORDS, HUID_VERIFICATION_PATH } from "@/lib/goldverse/huid-seo";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = buildMetadata({
  title: "HUID Verification Online — Verify BIS Gold Hallmark India",
  description:
    "Free online HUID verification for gold jewellery in India. Check BIS Hallmark Unique ID — verify purity, jeweller, weight and marking date. 5 free checks per account.",
  path: HUID_VERIFICATION_PATH,
  keywords: [...HUID_SEO_KEYWORDS],
  image:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600",
});

export default function HuidVerificationPage() {
  return (
    <div className="container space-y-10 py-8 md:py-10">
      <HuidVerificationJsonLd />

      <header className="max-w-3xl space-y-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          BIS Hallmark · India
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          HUID Verification Online
        </h1>
        <p className="text-sm text-muted-foreground md:text-base leading-relaxed">
          Verify your gold jewellery&apos;s{" "}
          <strong className="text-foreground">Hallmark Unique ID (HUID)</strong> against
          the official BIS database. Enter the 6-character code laser-marked on your
          ornament to confirm purity, jeweller details and hallmark authenticity before
          you buy or sell gold in India.
        </p>
        <p className="text-xs text-muted-foreground">
          Part of{" "}
          <Link href="/goldverse" className="text-amber-400 hover:underline">
            ContentVerse GoldVerse
          </Link>
          — gold rates, hallmark guide and buyer tools.
        </p>
      </header>

      <HuidVerifyPanel signInNext={`${HUID_VERIFICATION_PATH}#huid-verify`} />

      <HuidVerificationGuide />
    </div>
  );
}
