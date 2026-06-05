/**
 * Manual sports sync — fetches cricket data in small batches (RapidAPI BASIC safe).
 * Usage: npm run sports:sync
 */
import { isMonthlyQuotaError, syncSportsData } from "../lib/sports/sync";

async function main() {
  console.log("[sports:sync] starting (rotating mode, max ~8 API calls)…");
  const result = await syncSportsData();

  if (result.status === "skipped") {
    console.log(`[sports:sync] skipped — ${result.message}`);
    return;
  }

  console.log(
    `[sports:sync] ${result.status} — ${result.endpoints} endpoints in ${result.durationMs}ms`
  );

  if (result.message) {
    console.log(`[sports:sync] ${result.message}`);
  }

  if (result.errors.length) {
    console.warn("[sports:sync] errors:", result.errors.slice(0, 5));
    if (result.errors.length > 5) {
      console.warn(`… and ${result.errors.length - 5} more`);
    }
  }

  if (result.endpoints === 0 && result.status === "failed") {
    const monthly = result.errors.some(isMonthlyQuotaError);
    console.error(
      monthly
        ? "\nRapidAPI BASIC monthly quota is exhausted. Upgrade plan at rapidapi.com or wait for monthly reset. Sports pages will still use data already saved in DB."
        : "\nRapidAPI hourly limit reached. Wait ~1 hour and run again."
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[sports:sync] fatal", err);
  process.exit(1);
});
