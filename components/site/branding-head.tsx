import {
  DEFAULT_FAVICON_ICONS,
  isValidGoogleFaviconUrl,
  resolveFaviconForHead,
} from "@/lib/branding/favicon";
import { getBrandingAssets } from "@/lib/data/site-branding";

/** Favicon links — Google needs 48×48 PNG first; JPEG uploads are ignored for search. */
export async function BrandingHead() {
  const branding = await getBrandingAssets();
  const custom = branding.favicon.current;
  const googleIcon = resolveFaviconForHead(custom);
  const showCustom = custom && isValidGoogleFaviconUrl(custom) && custom !== googleIcon;

  return (
    <>
      <link rel="icon" type="image/png" sizes="48x48" href={DEFAULT_FAVICON_ICONS.primary} />
      <link rel="icon" type="image/png" sizes="192x192" href={DEFAULT_FAVICON_ICONS.large} />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="shortcut icon" href={googleIcon} />
      <link rel="apple-touch-icon" sizes="180x180" href={DEFAULT_FAVICON_ICONS.apple} />
      {showCustom ? <link rel="alternate icon" href={custom} /> : null}
    </>
  );
}
