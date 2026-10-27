import type { Metadata } from "next";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { PageBack } from "@/components/site/page-back";
import { VisualSitemap } from "@/components/site/visual-sitemap";
import { buildMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { withLocalePrefix } from "@/lib/i18n/config";
import { buildHreflangAlternates } from "@/lib/i18n/hreflang";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  return buildMetadata({
    title: t(dict, "hubs.siteMapTitle"),
    description: t(dict, "hubs.siteMapSub"),
    path: withLocalePrefix("/site-map", locale),
    alternates: buildHreflangAlternates("/site-map"),
  });
}

export default async function SiteMapPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <div className="container py-12 md:py-16 max-w-7xl">
      <PageBack href="/" label={t(dict, "common.home")} className="mb-6" />
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-neon-purple mb-2">
          {t(dict, "hubs.siteMapEyebrow")}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
          {t(dict, "hubs.siteMapTitle")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t(dict, "hubs.siteMapSub")}
        </p>
      </header>
      <VisualSitemap />
      <HubAdSense className="!px-0 mt-10" />
    </div>
  );
}
