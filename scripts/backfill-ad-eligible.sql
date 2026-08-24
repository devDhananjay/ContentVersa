-- P0 SEO: backfill AdSense eligibility for existing published quality posts.
-- Run ONLY when deploying P0 (after prisma migrate / db push). Do not run early.
-- Quality gate mirrors lib/seo/crawl-policy.ts:
--   readingTime >= 4, not discover-*, not *-daily-YYYY-MM-DD-*

UPDATE "Blog"
SET "adEligible" = true
WHERE status = 'PUBLISHED'
  AND "readingTime" >= 4
  AND slug NOT LIKE 'discover-%'
  AND slug !~ '-daily-[0-9]{4}-[0-9]{2}-[0-9]{2}-';

-- Optional sanity check:
-- SELECT COUNT(*) FROM "Blog" WHERE "adEligible" = true;
