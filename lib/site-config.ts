/** Production site URL (no trailing slash). Used when NEXT_PUBLIC_APP_URL is unset. */
export const PRODUCTION_SITE_URL = "https://contentverse.co.in";

import { getAppUrl } from "@/lib/app-url";

/** Hostname only, for SEO previews (e.g. contentverse.co.in). */
export function getSiteHostname(): string {
  const url = getAppUrl();
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch {
    return "contentverse.co.in";
  }
}
