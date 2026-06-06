/**
 * Quota-aware bootstrap — fills DB gradually within RapidAPI Basic limits.
 * Basic plan: 200 requests/month hard limit, 1000/hour.
 *
 * Usage:
 *   npm run sports:bootstrap          # up to 15 calls (or remaining quota)
 *   npm run sports:bootstrap          # run daily until complete
 */
import {
  estimateBootstrapDays,
  getBootstrapQueueSize,
  syncSportsBootstrap,
} from "../lib/sports/bootstrap-sync";
import { isMonthlyQuotaError } from "../lib/sports/sync";

async function main() {
  const total = await getBootstrapQueueSize();
  const days = estimateBootstrapDays(total);

  console.log(`[sports:bootstrap] queue: ~${total} endpoints`);
  console.log(
    `[sports:bootstrap] Basic plan (200/month) — expect ~${days} days to fill DB`
  );
  console.log("[sports:bootstrap] starting quota-aware sync…");

  const result = await syncSportsBootstrap();

  console.log(
    `[sports:bootstrap] synced=${result.synced} skipped=${result.skipped} complete=${result.complete}`
  );
  if (result.quotaMessage) {
    console.log(`[sports:bootstrap] quota: ${result.quotaMessage}`);
  }
  console.log(
    `[sports:bootstrap] duration ${Math.round(result.durationMs / 1000)}s`
  );

  if (result.errors.length) {
    console.warn("[sports:bootstrap] errors:", result.errors.slice(0, 8));
  }

  if (!result.complete) {
    console.log(
      "[sports:bootstrap] run again tomorrow — auto-sync also rotates 1 endpoint every 4 hours."
    );
  }

  if (result.synced === 0 && result.errors.some(isMonthlyQuotaError)) {
    console.error("Monthly quota exhausted — wait for reset or upgrade plan.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[sports:bootstrap] fatal", err);
  process.exit(1);
});
