/**
 * Daily AI draft articles — 1 per category (IST), Google News trending topics.
 * Content only (no cover). Cron: 11:00 PM IST.
 *
 *   npm run db:daily-ai
 *   npm run db:daily-ai -- --per-category=1 --max=24 --slot=all
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { runDailyArticleGeneration } from "../lib/seo/daily-articles";

function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    const path = join(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnvFiles();

function parseArgs(): {
  perCategory: number;
  maxTotal: number | undefined;
  runSlot: "all" | "first" | "second";
} {
  const perCat = process.argv.find((a) => a.startsWith("--per-category="));
  const maxArg = process.argv.find((a) => a.startsWith("--max="));
  const slotArg = process.argv.find((a) => a.startsWith("--slot="));
  const slotRaw = slotArg?.split("=")[1];
  const runSlot: "all" | "first" | "second" =
    slotRaw === "first" || slotRaw === "second" ? slotRaw : "all";
  return {
    perCategory: perCat ? Number(perCat.split("=")[1]) : 1,
    maxTotal: maxArg ? Number(maxArg.split("=")[1]) : undefined,
    runSlot,
  };
}

async function main() {
  const { perCategory, maxTotal, runSlot } = parseArgs();
  console.log(
    `Daily AI articles — ${perCategory} per category, slot=${runSlot} (IST)`
  );
  const result = await runDailyArticleGeneration({
    perCategory,
    maxTotal,
    runSlot,
  });
  console.log(
    `\nDay ${result.day}: ${result.created} created, ${result.skipped} skipped, ${result.failed} failed.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
