import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/**
 * Private app surfaces stay Disallow'd.
 * Thin public widgets (sports detail, stocks, reels, discover, leaderboard)
 * are crawlable but noindex via page metadata — see lib/seo/crawl-policy.ts.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // AdSense crawler must never be blocked (ads.txt + ad eligibility).
        userAgent: "Mediapartners-Google",
        allow: "/",
      },
      {
        userAgent: "AdsBot-Google",
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/admin",
          "/api",
          "/auth/",
          "/discover",
          "/reels",
          "/leaderboard",
        ],
      },
    ],
    sitemap: [`${SITE.url}/sitemap.xml`, `${SITE.url}/news-sitemap.xml`],
  };
}
