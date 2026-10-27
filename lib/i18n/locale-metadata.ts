import type { Metadata } from "next";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { withLocalePrefix, type AppLocale } from "@/lib/i18n/config";
import { buildHreflangAlternates } from "@/lib/i18n/hreflang";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { buildMetadata, SITE } from "@/lib/seo";

type HubMetaInput = {
  /** Path without locale prefix, e.g. `/jobs` */
  path: string;
  titleKey?: string;
  titleEn: string;
  titleHi: string;
  descriptionKey?: string;
  descriptionEn: string;
  descriptionHi: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
  modifiedTime?: string;
  publishedTime?: string;
  /**
   * When true (default for fully translated hubs): self-canonical per locale + hreflang.
   * When false: always canonicalize to English path (use for EN-only article/tool bodies under /hi).
   */
  bilingualIndex?: boolean;
};

/**
 * Locale-aware hub metadata with hreflang.
 * Keeps x-default on English; HI hubs get self-canonical when bilingualIndex.
 */
export async function buildLocaleHubMetadata(
  input: HubMetaInput
): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildLocaleHubMetadataFor(locale, input);
}

export function buildLocaleHubMetadataFor(
  locale: AppLocale,
  input: HubMetaInput
): Metadata {
  const dict = getDictionary(locale);
  const bilingual = input.bilingualIndex !== false;
  const titleFallback = locale === "hi" ? input.titleHi : input.titleEn;
  const descriptionFallback =
    locale === "hi" ? input.descriptionHi : input.descriptionEn;
  const title = input.titleKey
    ? t(dict, input.titleKey, titleFallback)
    : titleFallback;
  const description = input.descriptionKey
    ? t(dict, input.descriptionKey, descriptionFallback)
    : descriptionFallback;

  const enPath = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const localePath = withLocalePrefix(enPath === "/" ? "/" : enPath, locale);

  const shared = {
    title,
    description,
    keywords: input.keywords,
    image: input.image,
    noIndex: input.noIndex,
    type: input.type,
    modifiedTime: input.modifiedTime,
    publishedTime: input.publishedTime,
  };

  if (!bilingual) {
    // EN-only body under /hi — point crawl equity at English canonical.
    return buildMetadata({
      ...shared,
      path: enPath,
      canonicalUrl: `${SITE.url}${enPath === "/" ? "/" : enPath}`,
      alternates: input.noIndex
        ? undefined
        : buildHreflangAlternates(enPath, { includeHi: false }),
    });
  }

  return buildMetadata({
    ...shared,
    path: localePath,
    alternates: input.noIndex ? undefined : buildHreflangAlternates(enPath),
  });
}
