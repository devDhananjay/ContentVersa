/**
 * Client-safe TOI CDN URL helpers (no Node fs / sharp).
 * Watermark is burned in via `overlay-toi_sw` path params — strip them.
 * Known TOI default-logo msids are replaced with ContentVerse brand cover.
 */

import { DEFAULT_LOGO_ICON } from "@/lib/branding/logo";

/** Static 16:9 ContentVerse cover used when TOI only provides its red logo. */
export const NEWS_BRAND_COVER = "/news-brand-cover.jpg";

/**
 * TOI CDN assets that are the red "TOI" logo placeholder (not a news photo).
 * Seen repeatedly as default cover when an article has no real image.
 */
export const TOI_DEFAULT_LOGO_MSIDS = new Set(["47529300"]);

/** True when cover is already our brand asset (skip corner badge on detail). */
export function isContentVerseBrandCover(
  url: string | null | undefined
): boolean {
  if (!url) return false;
  const u = url.trim().toLowerCase().split("?")[0] || "";
  return (
    u.includes("cv-brand-cover") ||
    u === NEWS_BRAND_COVER ||
    u.endsWith("/news-brand-cover.jpg") ||
    u === DEFAULT_LOGO_ICON ||
    u.endsWith("/logo-icon.png") ||
    u.endsWith("/logo.png")
  );
}

export function isToiCdnUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  try {
    const host = new URL(url.trim()).hostname;
    return /(^|\.)toiimg\.com$/i.test(host) || /indiatimes\.com$/i.test(host);
  } catch {
    return /toiimg|indiatimes/i.test(url);
  }
}

/** Extract msid-NNNN from a TOI CDN URL. */
export function extractToiMsid(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/msid-(\d+)/i);
  return m?.[1] ?? null;
}

/** True when this URL is TOI's red logo placeholder (not a photo). */
export function isToiDefaultLogoUrl(url: string | null | undefined): boolean {
  const msid = extractToiMsid(url);
  return Boolean(msid && TOI_DEFAULT_LOGO_MSIDS.has(msid));
}

/**
 * Remove TOI watermark overlay params from static.toiimg.com thumb URLs.
 * Keeps msid + width + height so the photo stays the same, without the red TOI badge.
 * Returns NEWS_BRAND_COVER when the asset is TOI's default logo.
 */
export function cleanToiImageUrl(raw: string | null | undefined): string {
  const input = raw?.trim();
  if (!input) return "";
  if (isToiDefaultLogoUrl(input)) return NEWS_BRAND_COVER;

  try {
    const u = new URL(input);
    if (!/(^|\.)toiimg\.com$/i.test(u.hostname)) return input;

    // /thumb/msid-…,width-…,overlay-toi_sw,…/photo.jpg
    const m = u.pathname.match(/^(\/thumb\/)([^/]+)(\/[^/]*)?$/i);
    if (!m) {
      u.pathname = u.pathname
        .replace(/,overlay-toi[^,/]*/gi, "")
        .replace(/,(?:pt|y_pad|x_pad)-[^,/]*/gi, "");
      const cleaned = u.toString();
      return isToiDefaultLogoUrl(cleaned) ? NEWS_BRAND_COVER : cleaned;
    }

    const parts = m[2].split(",").filter(Boolean);
    const byKey = new Map<string, string>();
    for (const part of parts) {
      const key = part.split("-")[0]?.toLowerCase() || "";
      if (!key) continue;
      if (key === "overlay" || key.startsWith("overlay")) continue;
      if (key === "pt" || key === "y_pad" || key === "x_pad") continue;
      byKey.set(key, part);
    }

    const lean = ["msid", "width", "height"]
      .map((k) => byKey.get(k))
      .filter((p): p is string => Boolean(p));

    const finalParts =
      lean.length >= 2
        ? lean
        : [...byKey.values()].filter((p) => {
            const k = p.split("-")[0]?.toLowerCase() || "";
            return !["overlay", "pt", "y_pad", "x_pad"].includes(k);
          });

    const rest = m[3] || "/photo.jpg";
    u.pathname = `${m[1]}${finalParts.join(",")}${rest}`;
    const cleaned = u.toString();
    return isToiDefaultLogoUrl(cleaned) ? NEWS_BRAND_COVER : cleaned;
  } catch {
    return input;
  }
}

/**
 * Resolve any news/cover URL for display: brand cover for TOI logos,
 * cleaned TOI thumbs otherwise, pass-through for everything else.
 */
export function resolveNewsDisplayCover(
  url: string | null | undefined
): string | null {
  const raw = url?.trim();
  if (!raw) return null;
  if (isContentVerseBrandCover(raw)) return raw;
  if (isToiDefaultLogoUrl(raw)) return NEWS_BRAND_COVER;
  if (/toiimg\.com|overlay-toi/i.test(raw)) {
    return cleanToiImageUrl(raw) || NEWS_BRAND_COVER;
  }
  return raw;
}
