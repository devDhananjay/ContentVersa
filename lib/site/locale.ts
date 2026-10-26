import {
  LOCALE_COOKIE,
  isAppLocale,
  type AppLocale,
} from "@/lib/i18n/config";

export type SiteLocale = AppLocale;
export const SITE_LOCALE_KEY = LOCALE_COOKIE;
export const SITE_LOCALE_EVENT = "cv-site-locale";

export function isSiteLocale(v: unknown): v is SiteLocale {
  return isAppLocale(v);
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
  try {
    document.cookie = `${SITE_LOCALE_KEY}=${locale};path=/;max-age=${
      60 * 60 * 24 * 365
    };samesite=lax`;
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent(SITE_LOCALE_EVENT, { detail: { locale } })
  );
}
