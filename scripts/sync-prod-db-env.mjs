/**
 * Writes .env.local DATABASE_URL pointing at tunneled EC2 Postgres (localhost:5433).
 * Run: npm run db:tunnel && npm run db:sync-env
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const key = process.env.DB_TUNNEL_KEY || join(process.env.HOME || "", "Downloads/content.pem");
const host =
  process.env.DB_TUNNEL_HOST ||
  "ec2-user@ec2-52-66-204-66.ap-south-1.compute.amazonaws.com";
const localPort = process.env.DB_TUNNEL_LOCAL_PORT || "5433";

const remoteEnv = execSync(
  `ssh -i "${key}" -o ConnectTimeout=15 "${host}" 'grep ^DATABASE_URL= ~/ContentVersa/.env | head -1'`,
  { encoding: "utf8" }
).trim();

const match = remoteEnv.match(/^DATABASE_URL="?([^"\n]+)"?/);
if (!match) {
  console.error("Could not read DATABASE_URL from EC2");
  process.exit(1);
}

let url = match[1];
url = url.replace(/@[^:]+:\d+\//, `@localhost:${localPort}/`);

const line = `DATABASE_URL="${url}"`;
const target = join(root, ".env.local");
let body = existsSync(target) ? readFileSync(target, "utf8") : "";

if (/^DATABASE_URL=/m.test(body)) {
  body = body.replace(/^DATABASE_URL=.*$/m, line);
} else {
  body = `${body.trim()}\n${line}\n`;
}

writeFileSync(target, body.endsWith("\n") ? body : `${body}\n`);
console.log(`Updated .env.local → localhost:${localPort} (production data)`);
