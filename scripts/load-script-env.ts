import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/** Load .env then .env.local — .env.local wins (tunnel DATABASE_URL). */
export function loadScriptEnv(): void {
  const root = process.cwd();
  const merged: Record<string, string> = {};

  for (const file of [".env", ".env.local"]) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    Object.assign(merged, parseEnvFile(path));
  }

  for (const [key, val] of Object.entries(merged)) {
    process.env[key] = val;
  }
}

function parseEnvFile(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}
