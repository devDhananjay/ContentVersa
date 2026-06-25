/** Google Search favicon rules: square PNG/ICO/WebP/SVG — not JPEG photos. */
const GOOGLE_FAVICON_EXT = /\.(png|ico|webp|svg)(\?.*)?$/i;

export const DEFAULT_FAVICON_ICONS = {
  primary: "/favicon-48x48.png",
  fallback: "/favicon.ico",
  apple: "/apple-touch-icon.png",
  large: "/icon-192.png",
} as const;

export function isValidGoogleFaviconUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const path = url.trim().split("?")[0] ?? "";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return false;
  return GOOGLE_FAVICON_EXT.test(path);
}

export function resolveFaviconForHead(customUrl: string | null | undefined): string {
  if (customUrl && isValidGoogleFaviconUrl(customUrl)) return customUrl;
  return DEFAULT_FAVICON_ICONS.primary;
}
