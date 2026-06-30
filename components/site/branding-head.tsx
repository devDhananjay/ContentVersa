import { DEFAULT_FAVICON_ICONS } from "@/lib/branding/favicon";

/** Favicon links — 48×48 PNG first for Google Search; all sizes from /public brand assets. */
export function BrandingHead() {
  return (
    <>
      <link rel="icon" type="image/png" sizes="48x48" href={DEFAULT_FAVICON_ICONS.primary} />
      <link rel="icon" type="image/png" sizes="192x192" href={DEFAULT_FAVICON_ICONS.large} />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="shortcut icon" href={DEFAULT_FAVICON_ICONS.primary} />
      <link rel="apple-touch-icon" sizes="180x180" href={DEFAULT_FAVICON_ICONS.apple} />
    </>
  );
}
