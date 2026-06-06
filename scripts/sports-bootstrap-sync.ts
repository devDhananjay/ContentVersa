/**
 * One-time full bootstrap — syncs ALL sports endpoints to DB.
 * Resumes on rate limit (waits ~62 min, then continues).
 *
 * Usage:
 *   npm run sports:bootstrap
 *   SPORTS_BOOTSTRAP_FORCE=1 npm run sports:bootstrap  # re-fetch existing
 */
import {
  getBootstrapQueueSize,
  syncSportsBootstrap,
} from "../lib/sports/bootstrap-sync";
import { isMonthlyQuotaError } from "../lib/sports/sync";

async function main() {
  const total = await getBootstrapQueueSize();
  console.log(`[sports:bootstrap] queue size: ~${total} endpoints`);
  console.log("[sports:bootstrap] starting full DB sync…");

  const result = await syncSportsBootstrap({ waitOnRateLimit: true });

  console.log(
    `[sports:bootstrap] synced=${result.synced} skipped=${result.skipped} total=${result.total} complete=${result.complete}`
  );
  console.log(
    `[sports:bootstrap] duration ${Math.round(result.durationMs / 1000)}s`
  );

  if (result.errors.length) {
    console.warn("[sports:bootstrap] errors:", result.errors.slice(0, 8));
  }

  if (!result.complete && result.synced === 0) {
    const monthly = result.errors.some(isMonthlyQuotaError);
    if (monthly) {
      console.error("Monthly quota exhausted — upgrade RapidAPI plan or wait for reset.");
    }
    process.exit(1);
  }

  if (!result.complete) {
    console.log(
      "[sports:bootstrap] not finished — run again or let it resume (cursor saved in DB)"
    );
  }
}

main().catch((err) => {
  console.error("[sports:bootstrap] fatal", err);
  process.exit(1);
});
