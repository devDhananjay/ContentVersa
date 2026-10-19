const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-870543660";

/** Firebase / GA4 measurement ID (same property as Firebase Analytics). */
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim() || "";

/**
 * gtag.js — Google Ads conversion + GA4 (when measurement ID is set).
 * Literal <script> in SSR HTML for reliable first-paint loading.
 */
export function GoogleAdsTag() {
  if (!GOOGLE_ADS_ID && !GA_MEASUREMENT_ID) return null;

  const primaryId = GA_MEASUREMENT_ID || GOOGLE_ADS_ID;
  const configs = [
    GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });` : "",
    GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${configs}
          `.trim(),
        }}
      />
    </>
  );
}
