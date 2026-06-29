import type { Metadata } from "next";
import { VisualSitemap } from "@/components/site/visual-sitemap";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Site Map",
  description:
    "Explore every module and feature on ContentVerse — blogs, reels, sports, finance, jobs, creator tools and more.",
  path: "/site-map",
});

export default function SiteMapPage() {
  return (
    <div className="container py-12 md:py-16 max-w-7xl">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-neon-purple mb-2">
          Navigation
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
          Site Map
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Everything on ContentVerse — modules, pages, and functionality at a glance.
        </p>
      </header>
      <VisualSitemap />
    </div>
  );
}
