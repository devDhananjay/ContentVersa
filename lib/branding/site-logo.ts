import "server-only";

import { existsSync } from "fs";
import path from "path";
import { cache } from "react";
import { getBrandingAssets } from "@/lib/data/site-branding";
import { DEFAULT_LOGO_ICON, resolveSiteLogo } from "@/lib/branding/logo";

function publicFileExists(url: string): boolean {
  try {
    return existsSync(path.join(process.cwd(), "public", url));
  } catch {
    return false;
  }
}

/** SSR logo URL — falls back when DB upload is missing on local disk. */
export function resolveSiteLogoWithDisk(custom: string | null | undefined): string {
  const resolved = resolveSiteLogo(custom);
  if (resolved.startsWith("/uploads/") && !publicFileExists(resolved)) {
    return DEFAULT_LOGO_ICON;
  }
  return resolved;
}

export const getSiteLogoUrl = cache(async (): Promise<string> => {
  const assets = await getBrandingAssets();
  return resolveSiteLogoWithDisk(assets.logo.current);
});
