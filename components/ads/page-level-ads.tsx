import { normalizeAdSenseClientId } from "@/lib/adsense";

const ADSENSE_ID = normalizeAdSenseClientId(
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID
);

/**
 * Official AdSense page-level formats.
 * Bottom Anchor (open/close sticky bar) is off sitewide — it covers too much
 * of the mobile viewport. Vignette can still run when enabled in AdSense UI.
 * Utility routes also call DisableAutoAds.
 */
export function PageLevelAds() {
  if (!ADSENSE_ID) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(window.adsbygoogle=window.adsbygoogle||[]).push({google_ad_client:${JSON.stringify(ADSENSE_ID)},enable_page_level_ads:true,overlays:{bottom:false}});`,
      }}
    />
  );
}
