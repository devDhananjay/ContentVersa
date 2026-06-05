import type { MetadataRoute } from "next";
import { BLOGS } from "@/lib/data/blogs";
import { CATEGORIES } from "@/lib/data/categories";
import { SITE } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/blogs`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE.url}/categories`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE.url}/sports`, lastModified: now, changeFrequency: "hourly", priority: 0.85 },
    { url: `${SITE.url}/sports/teams`, lastModified: now, changeFrequency: "daily", priority: 0.75 },
    { url: `${SITE.url}/sports/players`, lastModified: now, changeFrequency: "daily", priority: 0.75 },
    ...CATEGORIES.map((c) => ({
      url: `${SITE.url}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...BLOGS.map((b) => ({
      url: `${SITE.url}/blog/${b.slug}`,
      lastModified: new Date(b.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
