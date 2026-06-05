import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SitePageRenderer } from "@/components/site/site-page-renderer";
import {
  getSitePageCached,
  type SitePageSlug,
} from "@/lib/data/site-pages";
import { buildMetadata } from "@/lib/seo";

export function makeSitePageMetadata(slug: SitePageSlug) {
  return async function generateMetadata(): Promise<Metadata> {
    const page = await getSitePageCached(slug);
    if (!page) return buildMetadata({ title: "Page", noIndex: true });
    return buildMetadata({
      title: page.title,
      description: page.subtitle,
      path: `/${slug}`,
    });
  };
}

export function makeSitePage(slug: SitePageSlug) {
  return async function SitePage() {
    const page = await getSitePageCached(slug);
    if (!page) notFound();
    return <SitePageRenderer page={page} />;
  };
}
