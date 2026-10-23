export type SiteLocale = "en" | "hi";

export const SITE_LOCALE_KEY = "cv-site-locale";
export const SITE_LOCALE_EVENT = "cv-site-locale";

export function isSiteLocale(v: unknown): v is SiteLocale {
  return v === "en" || v === "hi";
}

export function readSiteLocale(): SiteLocale {
  if (typeof window === "undefined") return "en";
  try {
    const raw = localStorage.getItem(SITE_LOCALE_KEY);
    if (isSiteLocale(raw)) return raw;
  } catch {
    /* private mode */
  }
  return "en";
}

export function writeSiteLocale(locale: SiteLocale) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SITE_LOCALE_KEY, locale);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent(SITE_LOCALE_EVENT, { detail: { locale } })
  );
}
