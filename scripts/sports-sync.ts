/**
 * Manual sports sync — respects RapidAPI Basic quota (200/month, 1000/hour).
 * Usage: npm run sports:sync
 */
import { isMonthlyQuotaError, syncSportsData } from "../lib/sports/sync";

async function main() {
  console.log("[sports:sync] starting (quota-aware, ~1 call/run)…");
  const result = await syncSportsData();

  if (result.quota) {
    console.log(
      `[sports:sync] quota: ${result.quota.monthUsed}/${result.quota.monthLimit} monthly`
    );
  }

  if (result.status === "skipped") {
    console.log(`[sports:sync] skipped — ${result.message}`);
    return;
  }

  console.log(
    `[sports:sync] ${result.status} — ${result.endpoints} endpoint(s) in ${result.durationMs}ms`
  );

  if (result.message) {
    console.log(`[sports:sync] ${result.message}`);
  }

  if (result.errors.length) {
    console.warn("[sports:sync] errors:", result.errors.slice(0, 5));
  }

  if (result.endpoints === 0 && result.status === "failed") {
    const monthly = result.errors.some(isMonthlyQuotaError);
    console.error(
      monthly
        ? "\nRapidAPI BASIC monthly quota (200) exhausted. Sports pages use cached DB data until reset."
        : "\nHourly rate limit reached. Try again in ~1 hour."
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[sports:sync] fatal", err);
  process.exit(1);
});
