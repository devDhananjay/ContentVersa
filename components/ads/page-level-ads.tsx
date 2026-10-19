import { normalizeAdSenseClientId } from "@/lib/adsense";

const ADSENSE_ID = normalizeAdSenseClientId(
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID
);

/**
 * Official AdSense page-level formats:
 * - Anchor (bottom sticky bar — we align bottom-left via AdSenseAnchorAlign)
 * - Vignette (interstitial between navigations; also enable in AdSense UI)
 *
 * Utility pages call DisableAutoAds to turn these off (tools, forms, auth).
 * Keep at most one custom CSS-sticky rail elsewhere so we don’t stack stickies
 * against the Anchor when both are on screen.
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
