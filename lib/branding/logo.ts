/** Official navbar/footer mark — do not use arbitrary admin uploads here. */
export const DEFAULT_LOGO_ICON = "/logo-icon.png";

const OFFICIAL_LOGO_PATHS = new Set([
  DEFAULT_LOGO_ICON,
  "/logo.png",
  "/logo-mark.svg",
]);

/**
 * Only official bundled brand assets may replace the default mark.
 * Admin uploads (e.g. WhatsApp photos) are ignored for consistent header/footer branding.
 */
export function resolveSiteLogo(custom: string | null | undefined): string | null {
  if (!custom?.trim()) return null;
  const path = custom.trim().split("?")[0] ?? "";
  return OFFICIAL_LOGO_PATHS.has(path) ? path : null;
}
