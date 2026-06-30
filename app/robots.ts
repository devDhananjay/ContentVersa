import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/admin",
          "/api",
          "/discover/",
          "/auth/",
          "/reels/",
          "/finance/stock/",
          "/sports/match/",
          "/sports/player/",
          "/sports/team/",
          "/sports/series/",
          "/sports/news/",
          "/leaderboard",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
