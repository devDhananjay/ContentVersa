import { cache } from "react";
import { getBrandingAssets } from "@/lib/data/site-branding";

/** Default navbar/footer icon — bundled brain logo in /public */
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
 * Resolve the single site-wide logo URL.
 * Invalid or missing branding falls back to the bundled default.
 */
export function resolveSiteLogo(custom: string | null | undefined): string {
  if (!custom?.trim()) return DEFAULT_LOGO_ICON;
  const path = custom.trim().split("?")[0] ?? "";
  return isValidLogoUrl(path) ? path : DEFAULT_LOGO_ICON;
}

/** Cached logo URL for SSR — same value in header, footer, auth, splash. */
export const getSiteLogoUrl = cache(async (): Promise<string> => {
  const assets = await getBrandingAssets();
  return resolveSiteLogo(assets.logo.current);
});
