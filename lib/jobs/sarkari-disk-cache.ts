import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { SarkariCategory, SarkariResponse } from "@/lib/jobs/types";

function cacheDir(): string {
  const base =
    process.env.SARKARI_CACHE_DIR?.trim() ||
    process.env.UPLOAD_DIR?.trim()?.replace(/\/uploads\/?$/, "") ||
    join(process.cwd(), "data");
  return join(base, "sarkari-cache");
}

function cachePath(category: SarkariCategory): string {
  return join(cacheDir(), `${category}.json`);
}

export function saveSarkariCache(
  category: SarkariCategory,
  payload: SarkariResponse
): void {
  try {
    const dir = cacheDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(
      cachePath(category),
      JSON.stringify({ savedAt: new Date().toISOString(), payload }),
      "utf8"
    );
  } catch {
    // Disk cache is best-effort — never break the page.
  }
}

export function readSarkariCache(
  category: SarkariCategory
): SarkariResponse | null {
  try {
    const path = cachePath(category);
    if (!existsSync(path)) return null;
    const raw = JSON.parse(readFileSync(path, "utf8")) as {
      payload?: SarkariResponse;
    };
    if (!raw.payload?.success || !Array.isArray(raw.payload.data)) return null;
    if (raw.payload.data.length === 0) return null;
    return raw.payload;
  } catch {
    return null;
  }
}
