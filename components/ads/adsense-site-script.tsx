const ADSENSE_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID?.trim();

/**
 * Literal <script> in SSR HTML — required for AdSense site verification.
 * next/script injects via __next_s; Google's crawler expects the snippet as-is.
 */
export function AdSenseSiteScript() {
  if (!ADSENSE_ID) return null;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
      crossOrigin="anonymous"
    />
  );
}
