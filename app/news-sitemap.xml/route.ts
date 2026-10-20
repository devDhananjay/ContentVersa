import { getNewsSitemapRows, renderNewsSitemapXml } from "@/lib/data/news-sitemap";

export const dynamic = "force-dynamic";
export const revalidate = 300;

/** GET /news-sitemap.xml — Live News briefings for fast Google discovery */
export async function GET() {
  try {
    const rows = await getNewsSitemapRows(100);
    const xml = renderNewsSitemapXml(rows);
    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("[news-sitemap]", err);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 200,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }
}
