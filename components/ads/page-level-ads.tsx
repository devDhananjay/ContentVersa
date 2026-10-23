import { normalizeAdSenseClientId } from "@/lib/adsense";

const ADSENSE_ID = normalizeAdSenseClientId(
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID
);

/**
 * Page-level formats.
 *
 * Bottom Anchor overlay is OFF (`overlays.bottom: false`). AdSense Auto Ads
 * in the account UI can still inject sticky bars — `AdSenseAnchorSuppress`
 * removes those. Vignette is not enabled in code (iOS leak); if the account
 * still serves one, chrome polish + leak guard apply.
 *
 * Also turn OFF “Anchor ads” under AdSense → site → Overlay formats.
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
