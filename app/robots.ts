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
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/api", "/auth/"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
