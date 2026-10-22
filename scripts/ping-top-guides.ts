/**
 * Ping IndexNow + sitemap endpoints for priority hubs/guides.
 *   npx tsx scripts/ping-top-guides.ts
 */
import { GUIDE_ARTICLES } from "../lib/guides/registry";
import { SITE } from "../lib/seo";
import { notifySearchEnginesOfUrls } from "../lib/seo/ping-index";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

async function main() {
  const priority = GUIDE_ARTICLES.filter(
    (g) =>
      g.section === "money" ||
      g.section === "jobs" ||
      g.section === "cricket" ||
      /emi|sip|upi|ssc|sarkari|scorecard|preview|fastag|cibil|ppf/i.test(
        `${g.slug} ${g.title}`
      )
  );

  const urls = [
    `${SITE.url}/`,
    `${SITE.url}/guides`,
    `${SITE.url}/guides/money`,
    `${SITE.url}/guides/jobs`,
    `${SITE.url}/guides/cricket`,
    `${SITE.url}/jobs/govt`,
    `${SITE.url}/tools`,
    `${SITE.url}/news`,
    `${SITE.url}/blogs`,
    ...priority.map((g) => `${SITE.url}/guides/${g.section}/${g.slug}`),
  ];

  console.log(`Pinging ${urls.length} URLs…`);
  await notifySearchEnginesOfUrls(urls);
  console.log("Done. Also submit/refresh sitemaps in Google Search Console.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
