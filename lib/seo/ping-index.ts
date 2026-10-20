/**
 * Notify search engines when Live News / blogs publish — IndexNow + sitemap ping.
 */

import { SITE } from "@/lib/seo";

const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY?.trim() || "cv-india-news-indexnow-key";

export function indexNowKey(): string {
  return INDEXNOW_KEY;
}

/** Absolute public key file URL required by IndexNow. */
export function indexNowKeyLocation(): string {
  return `${SITE.url}/${INDEXNOW_KEY}.txt`;
}

export async function pingIndexNow(urls: string[]): Promise<void> {
  const list = [...new Set(urls.map((u) => u.trim()).filter(Boolean))].slice(
    0,
    100
  );
  if (!list.length) return;

  const body = {
    host: new URL(SITE.url).host,
    key: INDEXNOW_KEY,
    keyLocation: indexNowKeyLocation(),
    urlList: list,
  };

  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ];

  await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      if (!res.ok) {
        console.warn(
          `[indexnow] ${endpoint} → ${res.status}`,
          (await res.text().catch(() => "")).slice(0, 120)
        );
      } else {
        console.log(`[indexnow] ok ${endpoint} urls=${list.length}`);
      }
    })
  );
}

/** Ask Google/Bing to refetch sitemaps (best-effort; GSC submit still recommended). */
export async function pingSitemaps(): Promise<void> {
  const sitemaps = [
    `${SITE.url}/sitemap.xml`,
    `${SITE.url}/news-sitemap.xml`,
  ];
  await Promise.allSettled(
    sitemaps.flatMap((sitemapUrl) => [
      fetch(
        `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
        { cache: "no-store" }
      ).catch(() => null),
      fetch(
        `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
        { cache: "no-store" }
      ).catch(() => null),
    ])
  );
}

export async function notifySearchEnginesOfUrls(urls: string[]): Promise<void> {
  try {
    await Promise.all([pingIndexNow(urls), pingSitemaps()]);
  } catch (err) {
    console.warn("[seo-ping]", err);
  }
}
