/**
 * Print P2 content plan + refresh candidates (local / CI ops).
 * Usage: npx tsx scripts/p2-seo-report.ts
 */
import { P2_CONTENT_TOPICS } from "../lib/seo/p2-content-plan";
import { getSeoRefreshCandidates } from "../lib/seo/refresh-candidates";

async function main() {
  console.log(`\n=== P2 content plan (${P2_CONTENT_TOPICS.length} topics) ===\n`);
  for (const t of P2_CONTENT_TOPICS.filter((x) => x.priority === "high")) {
    console.log(`[high] ${t.title}`);
    console.log(`       ${t.searchIntent}`);
  }

  console.log(`\n=== Refresh candidates ===\n`);
  const candidates = await getSeoRefreshCandidates(15);
  if (!candidates.length) {
    console.log("(none — DB may be offline or no matches)");
    return;
  }
  for (const c of candidates) {
    console.log(`[${c.score}] ${c.title} (${c.views} views)`);
    console.log(`       ${c.reasons.join("; ")}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
