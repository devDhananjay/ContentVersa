import { normalizeAdSenseClientId } from "@/lib/adsense";

const ADSENSE_ID = normalizeAdSenseClientId(
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID
);

/**
 * Page-level formats: keep regular bottom Anchor only.
 *
 * Vignette (full-screen interstitial) is intentionally NOT enabled here —
 * on iOS Safari / Next.js, vignette close often dumps raw Google JS
 * (`window.dicnf` / Closure) as a blank page. Turn Vignette OFF in AdSense
 * UI too (Ads → site → Overlay formats) so account settings match.
 *
 * Utility routes still call DisableAutoAds to kill anchors there.
 */
export function PageLevelAds() {
  if (!ADSENSE_ID) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(window.adsbygoogle=window.adsbygoogle||[]).push({google_ad_client:${JSON.stringify(ADSENSE_ID)},enable_page_level_ads:true,overlays:{bottom:true}});`,
      }}
    />
  );
}
