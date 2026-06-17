import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/data/sitemap-urls";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemapEntries();
}
