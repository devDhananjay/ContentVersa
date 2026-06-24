const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-870543660";

/**
 * Google Ads conversion tag (gtag.js) — literal <script> in SSR HTML for reliable loading.
 */
export function GoogleAdsTag() {
  if (!GOOGLE_ADS_ID) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');
          `.trim(),
        }}
      />
    </>
  );
}
