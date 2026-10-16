/**
 * Archive near-duplicate drafts, prep AdSense-safe shortlist, then publish.
 *
 *   npx tsx scripts/publish-adsense-shortlist.ts           # dry-run
 *   npx tsx scripts/publish-adsense-shortlist.ts --apply   # write to DB
 *
 * Uses .env.local DATABASE_URL (prod tunnel on :5433).
 */
import { BlogStatus, PrismaClient } from "@prisma/client";
import {
  normalizeTitleKey,
  passesArticleQualityGate,
  wordCount,
} from "../lib/seo/article-quality";
import { isIndexableArticle } from "../lib/seo/crawl-policy";
import { publicCanonicalUrl } from "../lib/seo/content-redirects";
import { prepareAiFreePublishFields } from "../lib/seo/ai-free-content";
import { readingTime } from "../lib/utils";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

/** Unique winners to publish (already cross-checked vs live published). */
const KEEPERS: string[] = [
  "mental-health-insurance-in-india-a-complete-guide-to-claims-access",
  "startup-india-fund-of-funds-20-eligibility-how-to-apply",
  "cursor-ai-india-office-what-developers-need-to-know-about-features-plans",
  "gen-z-career-guide-navigating-indias-booming-formal-job-market-in-2026",
  "live-in-vs-marriage-legal-rights-protection-in-india-explained",
  "upcoming-nse-ipo-expected-date-valuation-and-investor-guide",
  "rbi-rules-on-phone-locking-for-missed-emis-what-borrowers-must-know",
  "radhika-guptas-10-30-50-rule-smart-investment-guide-for-women",
  "non-tier-1-tech-career-blueprint-how-to-10x-salary-without-an-iit-degree",
  "sebis-upcoming-ai-rules-what-kill-switch-controls-mean-for-traders",
  "why-global-funds-are-underweight-on-indian-stocks-bofa-survey-explained",
  "indias-cervical-cancer-elimination-plan-hpv-vaccine-screening-guide",
  "why-vibe-coding-with-ai-could-risk-your-tech-career-in-india",
  "education-loan-in-india-vs-host-country-which-is-better",
  "valorant-campus-cup-2026-complete-guide-for-indian-college-gamers",
];

/** Near-duplicate drafts → archive with canonical to the cluster keeper. */
const ARCHIVE_TO_KEEPER: Record<string, string[]> = {
  "startup-india-fund-of-funds-20-eligibility-how-to-apply": [
    "startup-india-fund-of-funds-20-what-indian-founders-need-to-know",
    "startup-india-fund-of-funds-20-how-startups-can-access-the-10000-cr-pool",
    "startup-india-fund-of-funds-20-how-indian-founders-can-benefit",
    "dpiit-fund-of-funds-20-how-startups-can-tap-into-the-10000-cr-pool",
  ],
  "upcoming-nse-ipo-expected-date-valuation-and-investor-guide": [
    "nse-ipo-guide-key-things-retail-investors-must-know-before-the-mega-laun",
    "nse-ipo-guide-what-retail-investors-should-know-before-the-mega-issue",
    "nse-ipo-guide-how-retail-investors-can-prepare-for-indias-biggest-listin",
  ],
  "mental-health-insurance-in-india-a-complete-guide-to-claims-access": [
    "decoding-mental-health-insurance-in-india-a-guide-to-policy-and-access",
    "decoding-mental-health-insurance-in-india-a-patient-guide",
    "mental-health-insurance-in-india-what-your-policy-actually-covers",
  ],
  "live-in-vs-marriage-legal-rights-protection-in-india-explained": [
    "live-in-vs-marriage-in-india-legal-rights-protection-explained",
    "live-in-relationships-vs-marriage-in-india-legal-rights-protections-expl",
    "live-in-vs-marriage-in-india-legal-rights-protection-explained-1",
    "delhi-hc-on-live-in-relationships-legal-rights-police-protection",
  ],
  "cursor-ai-india-office-what-developers-need-to-know-about-features-plans": [
    "cursor-ai-india-launch-pricing-local-features-and-developer-guide",
    "cursor-expands-to-india-what-it-means-for-local-software-developers",
  ],
  "rbi-rules-on-phone-locking-for-missed-emis-what-borrowers-must-know": [
    "rbi-new-rules-on-emi-defaults-can-lenders-legally-lock-your-phone",
  ],
  "indias-cervical-cancer-elimination-plan-hpv-vaccine-screening-guide": [
    "cervical-cancer-in-india-symptoms-hpv-vaccine-costs-prevention",
  ],
  "why-vibe-coding-with-ai-could-risk-your-tech-career-in-india": [
    "will-ai-replace-indian-software-engineers-in-2026-what-developers-must-k",
    "ai-jobs-surge-in-india-top-skills-to-learn-in-2026",
    "navigating-indias-job-crisis-skills-ai-manufacturing",
    "navigating-indias-job-crisis-ai-skills-and-survival-strategies",
  ],
};

/** Extra near-dupes with no shortlist winner yet — archive to /blogs hub. */
const ARCHIVE_TO_BLOGS_HUB: string[] = [
  "5-work-life-habits-to-learn-from-british-colleagues-for-better-productiv",
  "work-from-home-vs-office-in-india-productivity-habits-that-actually-work",
  "5-work-from-home-habits-that-actually-boost-daily-productivity",
  "work-from-home-in-india-is-remote-work-making-us-more-productive",
  "5-workplace-habits-from-global-offices-indians-can-adopt-for-success",
  "dhurandhar-2-ott-release-date-where-to-watch-ranveer-singhs-spy-thriller",
  "dhurandhar-2-ott-release-date-streaming-platform-and-plot-details",
  "independence-day-2026-ott-watchlist-top-patriotic-movies-to-stream-now",
  "top-ott-releases-this-week-15-new-movies-to-watch-on-netflix-and-prime",
  "new-ott-releases-this-weekend-top-movies-shows-on-netflix-prime-jiohotst",
  "independence-day-long-weekend-ott-watchlist-top-movies-to-binge",
  "10-best-ott-releases-and-patriotic-movies-to-watch-this-independence-day",
  "why-budget-fast-fashion-brands-are-dominating-small-town-india",
  "fast-fashion-in-small-town-india-zudio-and-trends-success-story",
  "fast-fashion-in-small-town-india-zudio-and-trends-success-stories",
  "mahindra-scorpio-lifestyler-pickup-price-features-india-launch-details",
  "mahindra-scorpio-lifestyler-pickup-price-features-india-launch-details-1",
  "mahindra-scorpio-lifestyler-indias-new-pickup-trend-explained",
  "pm-modis-1-crore-ai-skilling-push-how-youth-can-apply-for-free-training",
  "pm-modis-1-crore-ai-skilling-scheme-how-indian-youth-pros-can-benefit",
  "pm-modis-1-crore-youth-ai-skilling-scheme-how-to-apply-what-to-expect",
  "india-vs-sri-lanka-2nd-test-live-streaming-tv-guide",
  "how-india-stunned-england-to-reach-the-t20-world-cup-final",
];

const YMYL_BODY_NOTE = `

---

> **Educational note:** This article is for general information only — not personalised financial, legal, medical, or investment advice. Verify figures and eligibility on official portals (RBI, SEBI, MoHFW, Income Tax, etc.) or with a qualified professional before you act.
`;

function tokens(title: string): string[] {
  const stop = new Set(
    "the a an in on of for to and or vs what how why key guide india indian 2026 complete must know before top best your from with are can need needs things this that will about explained".split(
      " "
    )
  );
  return normalizeTitleKey(title)
    .split(" ")
    .filter((w) => w.length > 3 && !stop.has(w));
}

function jaccard(a: string, b: string): number {
  const A = new Set(tokens(a));
  const B = new Set(tokens(b));
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union ? inter / union : 0;
}

function stripAiDailyKeywords(meta: string | null | undefined): string {
  const parts = (meta || "")
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !/ai-daily/i.test(s) && !/^cron$/i.test(s));
  return parts.join(", ");
}

function ensureYmylNote(content: string, categorySlug: string | null): string {
  const ymylCats = new Set([
    "finance",
    "business",
    "health",
    "psychology",
    "relationships",
    "startups",
    "ai",
  ]);
  if (!categorySlug || !ymylCats.has(categorySlug)) return content;
  if (/educational note|not personalised|not financial advice|not medical advice/i.test(content)) {
    return content;
  }
  return content.trimEnd() + YMYL_BODY_NOTE;
}

async function main() {
  console.log(apply ? "MODE: APPLY" : "MODE: dry-run (pass --apply to write)");

  const published = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    select: { id: true, title: true, slug: true },
  });

  const keepers = await prisma.blog.findMany({
    where: { slug: { in: KEEPERS } },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      excerpt: true,
      content: true,
      metaDescription: true,
      readingTime: true,
      metaKeywords: true,
      coverImage: true,
      category: { select: { slug: true } },
    },
  });

  if (keepers.length !== KEEPERS.length) {
    const found = new Set(keepers.map((k) => k.slug));
    const missing = KEEPERS.filter((s) => !found.has(s));
    console.error("Missing keepers:", missing);
    process.exit(1);
  }

  // --- Safety: keepers vs published + pairwise ---
  const blocked: string[] = [];
  for (const k of keepers) {
    for (const p of published) {
      const sameTitle = normalizeTitleKey(k.title) === normalizeTitleKey(p.title);
      const similar = jaccard(k.title, p.title) >= 0.55;
      if (sameTitle || similar || k.slug === p.slug) {
        blocked.push(`${k.slug} overlaps live ${p.slug}`);
      }
    }
  }
  for (let i = 0; i < keepers.length; i++) {
    for (let j = i + 1; j < keepers.length; j++) {
      if (jaccard(keepers[i]!.title, keepers[j]!.title) >= 0.5) {
        blocked.push(`keeper pair: ${keepers[i]!.slug} ~ ${keepers[j]!.slug}`);
      }
    }
  }
  if (blocked.length) {
    console.error("BLOCKED — overlaps detected:\n" + blocked.join("\n"));
    process.exit(1);
  }
  console.log(`✓ ${keepers.length} keepers unique vs ${published.length} published`);

  // --- Archive near-dupes ---
  let archivePlan = 0;
  let archived = 0;

  for (const [keeperSlug, losers] of Object.entries(ARCHIVE_TO_KEEPER)) {
    const dest = `/blog/${keeperSlug}`;
    for (const slug of losers) {
      const row = await prisma.blog.findUnique({
        where: { slug },
        select: { id: true, status: true, slug: true, title: true },
      });
      if (!row) {
        console.log(`  skip missing archive candidate: ${slug}`);
        continue;
      }
      if (row.status === BlogStatus.ARCHIVED) continue;
      if (KEEPERS.includes(slug)) {
        console.log(`  skip (is keeper): ${slug}`);
        continue;
      }
      archivePlan++;
      console.log(`ARCHIVE → ${dest} :: ${slug}`);
      if (apply) {
        await prisma.blog.update({
          where: { id: row.id },
          data: {
            status: BlogStatus.ARCHIVED,
            adEligible: false,
            canonicalUrl: publicCanonicalUrl(dest),
          },
        });
        archived++;
      }
    }
  }

  for (const slug of ARCHIVE_TO_BLOGS_HUB) {
    if (KEEPERS.includes(slug)) continue;
    const row = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });
    if (!row || row.status === BlogStatus.ARCHIVED) continue;
    archivePlan++;
    console.log(`ARCHIVE → /blogs :: ${slug}`);
    if (apply) {
      await prisma.blog.update({
        where: { id: row.id },
        data: {
          status: BlogStatus.ARCHIVED,
          adEligible: false,
          canonicalUrl: publicCanonicalUrl("/blogs"),
        },
      });
      archived++;
    }
  }

  // --- Prep + publish keepers ---
  let publishPlan = 0;
  let publishedNow = 0;

  for (const k of keepers) {
    if (k.status === BlogStatus.PUBLISHED) {
      console.log(`already published: ${k.slug}`);
      continue;
    }
    if (k.status === BlogStatus.ARCHIVED) {
      console.log(`skip archived keeper: ${k.slug}`);
      continue;
    }

    let content = k.content;
    content = ensureYmylNote(content, k.category?.slug ?? null);
    const words = wordCount(content);
    const rt = readingTime(content);
    const metaKeywords = stripAiDailyKeywords(k.metaKeywords);
    const qualityOk =
      passesArticleQualityGate(content) &&
      isIndexableArticle({ slug: k.slug, readingTime: rt, metaKeywords });

    if (!qualityOk) {
      console.error(
        `QUALITY FAIL ${k.slug}: words=${words} rt=${rt} meta=${metaKeywords.slice(0, 60)}`
      );
      continue;
    }

    publishPlan++;
    console.log(
      `PUBLISH ${k.slug} · ${words}w · ${rt}m · cover=${Boolean(k.coverImage)} · adEligible=${qualityOk}`
    );

    if (apply) {
      let title = k.title;
      let excerpt = k.excerpt ?? null;
      let metaDescription = k.metaDescription ?? null;
      let publishContent = content;
      try {
        const cleaned = prepareAiFreePublishFields({
          title,
          excerpt,
          content: publishContent,
          metaDescription,
        });
        title = cleaned.title;
        excerpt = cleaned.excerpt;
        publishContent = cleaned.content;
        metaDescription = cleaned.metaDescription;
      } catch (err) {
        console.error(
          `AI-FREE FAIL ${k.slug}: ${
            err instanceof Error ? err.message : "blocked"
          }`
        );
        continue;
      }
      await prisma.blog.update({
        where: { id: k.id },
        data: {
          title,
          excerpt,
          content: publishContent,
          metaDescription,
          readingTime: readingTime(publishContent),
          metaKeywords,
          status: BlogStatus.PUBLISHED,
          publishedAt: new Date(),
          adEligible: true,
        },
      });
      publishedNow++;
    }
  }

  // Final published duplicate title check among keepers after plan
  console.log("\n--- summary ---");
  console.log(`Archive planned: ${archivePlan}${apply ? ` · done: ${archived}` : ""}`);
  console.log(`Publish planned: ${publishPlan}${apply ? ` · done: ${publishedNow}` : ""}`);
  if (!apply) console.log("\nDry run only. Re-run with --apply to write.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
