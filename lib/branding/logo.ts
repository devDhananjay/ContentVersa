/** Shared logo constants — safe for client + server (no Node fs). */
export const DEFAULT_LOGO_ICON = "/logo-icon.png";

const OFFICIAL_LOGO_PATHS = new Set([
  DEFAULT_LOGO_ICON,
  "/logo.png",
  "/logo-mark.svg",
]);

const LOGO_EXT = /\.(png|jpe?g|webp|svg)$/i;

/** Whether an admin-uploaded or bundled path may be used as the site logo. */
export function isValidLogoUrl(url: string): boolean {
  const path = (url.trim().split("?")[0] ?? "").toLowerCase();
  if (!path.startsWith("/")) return false;
  if (OFFICIAL_LOGO_PATHS.has(path)) return true;
  if (path.startsWith("/uploads/")) return LOGO_EXT.test(path);
  return false;
}

/**
 * Resolve logo URL from DB value (format validation only).
 * Server code should call `resolveSiteLogoWithDisk` for upload existence checks.
 */
export function resolveSiteLogo(custom: string | null | undefined): string {
  if (!custom?.trim()) return DEFAULT_LOGO_ICON;
  const logoPath = custom.trim().split("?")[0] ?? "";
  return isValidLogoUrl(logoPath) ? logoPath : DEFAULT_LOGO_ICON;
}
