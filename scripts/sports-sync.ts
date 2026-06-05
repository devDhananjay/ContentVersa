/**
 * Manual sports sync — fetches all Cricbuzz endpoints and stores in Postgres.
 * Usage: npm run sports:sync
 */
import { syncSportsData } from "../lib/sports/sync";

async function main() {
  console.log("[sports:sync] starting…");
  const result = await syncSportsData();
  console.log(
    `[sports:sync] ${result.status} — ${result.endpoints} endpoints in ${result.durationMs}ms`
  );
  if (result.errors.length) {
    console.error("[sports:sync] errors:", result.errors.slice(0, 10));
    process.exit(result.ok ? 0 : 1);
  }
}

main().catch((err) => {
  console.error("[sports:sync] fatal", err);
  process.exit(1);
});
