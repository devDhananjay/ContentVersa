import { SITE } from "@/lib/seo";
import { withLocalePrefix } from "@/lib/i18n/config";

/**
 * Build absolute alternates for a path (without locale prefix).
 * UI hubs: pass includeHi true (default). Blog posts: only when HI is PUBLISHED.
 */
export function buildHreflangAlternates(
  pathWithoutLocale: string,
  opts?: { includeHi?: boolean }
): {
  languages: Record<string, string>;
} {
  const includeHi = opts?.includeHi !== false;
  const base = SITE.url.replace(/\/$/, "");
  const clean =
    pathWithoutLocale === "/"
      ? ""
      : pathWithoutLocale.startsWith("/")
        ? pathWithoutLocale
        : `/${pathWithoutLocale}`;

  const enPath = clean || "/";
  const enUrl = `${base}${enPath === "/" ? "/" : enPath}`;
  const languages: Record<string, string> = {
    en: enUrl,
    "x-default": enUrl,
  };

  if (includeHi) {
    const hiPath = withLocalePrefix(enPath === "/" ? "/" : enPath, "hi");
    languages.hi = `${base}${hiPath}`;
  }

  return { languages };
}
