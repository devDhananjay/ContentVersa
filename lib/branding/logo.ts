/** Square brand mark for header/footer — not arbitrary admin JPEG uploads. */
export const DEFAULT_LOGO_ICON = "/logo-icon.png";

const LOGO_EXT = /\.(png|webp|svg)(\?.*)?$/i;

/** Admin logo uploads must be PNG/WebP/SVG (same rule as favicon — no photos). */
export function isValidBrandLogoUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const path = url.trim().split("?")[0] ?? "";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return false;
  return LOGO_EXT.test(path);
}

/** Navbar/footer always use the official mark unless a valid brand PNG is set. */
export function resolveSiteLogo(custom: string | null | undefined): string | null {
  if (custom && isValidBrandLogoUrl(custom)) return custom;
  return null;
}
