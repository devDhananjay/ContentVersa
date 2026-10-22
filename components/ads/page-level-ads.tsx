import { normalizeAdSenseClientId } from "@/lib/adsense";

const ADSENSE_ID = normalizeAdSenseClientId(
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID
);

/**
 * Official AdSense page-level formats (vignette + regular bottom Anchor).
 * Dynamic/collapsible (half-screen) Anchors are off in AdSense UI; bottom-only
 * regular Anchors stay on for desktop+mobile. Utility routes call DisableAutoAds.
 */
export function PageLevelAds() {
  if (!ADSENSE_ID) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(window.adsbygoogle=window.adsbygoogle||[]).push({google_ad_client:${JSON.stringify(ADSENSE_ID)},enable_page_level_ads:true});`,
      }}
    />
  );
}
