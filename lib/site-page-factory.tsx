import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SitePageRenderer } from "@/components/site/site-page-renderer";
import {
  getSitePageCached,
  type SitePageSlug,
} from "@/lib/data/site-pages";
import { withLocalePrefix } from "@/lib/i18n/config";
import { buildHreflangAlternates } from "@/lib/i18n/hreflang";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { buildMetadata } from "@/lib/seo";

export function makeSitePageMetadata(slug: SitePageSlug) {
  return async function generateMetadata(): Promise<Metadata> {
    const locale = await getRequestLocale();
    const page = await getSitePageCached(slug, locale);
    if (!page) return buildMetadata({ title: "Page", noIndex: true });
    return buildMetadata({
      title: page.title,
      description: page.subtitle,
      path: withLocalePrefix(`/${slug}`, locale),
      alternates: buildHreflangAlternates(`/${slug}`),
    });
  };
}

export function makeSitePage(slug: SitePageSlug) {
  return async function SitePage() {
    const locale = await getRequestLocale();
    const page = await getSitePageCached(slug, locale);
    if (!page) notFound();
    return <SitePageRenderer page={page} />;
  };
}
