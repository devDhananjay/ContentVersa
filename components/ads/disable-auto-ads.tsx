import { normalizeAdSenseClientId } from "@/lib/adsense";

const ADSENSE_ID = normalizeAdSenseClientId(
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID
);

/**
 * Turns off AdSense Auto ads / overlays on utility pages (tools, HUID, MoneyVerse).
 * Keep ads on blogs, guides, and editorial hubs only.
 */
export function DisableAutoAds() {
  if (!ADSENSE_ID) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(window.adsbygoogle=window.adsbygoogle||[]).push({google_ad_client:${JSON.stringify(ADSENSE_ID)},enable_page_level_ads:false,overlays:{bottom:false}});`,
      }}
    />
  );
}
