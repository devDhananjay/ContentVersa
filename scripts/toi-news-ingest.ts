/**
 * TOI RSS → Gemini rewrite → blogs. Every 30 min via cron-toi-news.sh.
 *
 *   npm run db:toi-news
 *   npm run db:toi-news -- --max=2 --publish=1
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { runToiNewsIngest } from "../lib/seo/toi-news-ingest";

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
  maxPerRun: number | undefined;
  publish: boolean | undefined;
  force: boolean;
} {
  let maxPerRun: number | undefined;
  let publish: boolean | undefined;
  let force = false;
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--max=")) {
      maxPerRun = Number(arg.slice(6));
    } else if (arg === "--publish=1" || arg === "--publish") {
      publish = true;
    } else if (arg === "--publish=0" || arg === "--draft") {
      publish = false;
    } else if (arg === "--force") {
      force = true;
    }
  }
  return { maxPerRun, publish, force };
}

async function main() {
  const args = parseArgs();
  console.log("[toi-news] starting", args);
  const result = await runToiNewsIngest(args);
  console.log("[toi-news] done", JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("[toi-news] fatal", err);
  process.exit(1);
});
