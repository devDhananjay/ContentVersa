export const LOCALES = ["en", "hi"] as const;
export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";
export const LOCALE_COOKIE = "cv-site-locale";
export const LOCALE_HEADER = "x-cv-locale";

export function isAppLocale(v: unknown): v is AppLocale {
  return v === "en" || v === "hi";
}

/** Strip leading /hi from pathname. */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/hi") return "/";
  if (pathname.startsWith("/hi/")) {
    const rest = pathname.slice(3);
    return rest.startsWith("/") ? rest : `/${rest}`;
  }
  return pathname;
}

/** Add /hi prefix when locale is hi (EN stays unprefixed). */
export function withLocalePrefix(pathname: string, locale: AppLocale): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (locale === "en") {
    return stripLocalePrefix(path);
  }
  const stripped = stripLocalePrefix(path);
  if (stripped === "/") return "/hi";
  return `/hi${stripped}`;
}

export function localeFromPathname(pathname: string): AppLocale {
  if (pathname === "/hi" || pathname.startsWith("/hi/")) return "hi";
  return "en";
}

export function htmlLang(locale: AppLocale): string {
  return locale === "hi" ? "hi" : "en";
}
