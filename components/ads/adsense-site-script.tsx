import { normalizeAdSenseClientId } from "@/lib/adsense";

const ADSENSE_ID = normalizeAdSenseClientId(
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID
);

/**
 * Literal <script> in SSR HTML — required for AdSense site verification.
 * next/script injects via __next_s; Google's crawler expects the snippet as-is.
 *
 * data-overlays="collapsed-bottom": regular (non-collapsible) Anchor at bottom
 * only — opts out of the large dynamic/collapsible half-screen format.
 */
export function AdSenseSiteScript() {
  if (!ADSENSE_ID) return null;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
      crossOrigin="anonymous"
      data-overlays="collapsed-bottom"
    />
  );
}
