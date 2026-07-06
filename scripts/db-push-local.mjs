/**
 * prisma db push using DATABASE_URL from .env.local (tunneled prod / real local DB).
 * Next.js dev uses .env.local; plain `npm run db:push` only reads .env (often wrong port).
 *
 * Run: npm run db:tunnel && npm run db:push:local
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const target = join(process.cwd(), ".env.local");
if (!existsSync(target)) {
  console.error("Missing .env.local — run npm run db:sync-env after db:tunnel");
  process.exit(1);
}

const body = readFileSync(target, "utf8");
const match = body.match(/^DATABASE_URL=(.+)$/m);
if (!match) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const databaseUrl = match[1].replace(/^"|"$/g, "");
console.log("Using DATABASE_URL from .env.local → prisma db push");

execSync("npx prisma db push", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: databaseUrl },
});
