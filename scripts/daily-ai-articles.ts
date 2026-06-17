/**
 * Daily AI articles — 2 per category (IST).
 *
 *   npm run db:daily-ai
 *   npm run db:daily-ai -- --per-category=2 --max=42
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

function parseArgs() {
  const perCat = process.argv.find((a) => a.startsWith("--per-category="));
  const maxArg = process.argv.find((a) => a.startsWith("--max="));
  return {
    perCategory: perCat ? Number(perCat.split("=")[1]) : 2,
    maxTotal: maxArg ? Number(maxArg.split("=")[1]) : undefined,
  };
}

async function main() {
  const { perCategory, maxTotal } = parseArgs();
  console.log(`Daily AI articles — ${perCategory} per category (IST)`);
  const result = await runDailyArticleGeneration({ perCategory, maxTotal });
  console.log(
    `\nDay ${result.day}: ${result.created} created, ${result.skipped} skipped, ${result.failed} failed.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
