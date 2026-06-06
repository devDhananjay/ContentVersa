import { SportsApiError, cricbuzzFetch } from "./cricbuzz-client";
import { setSportsDbCache } from "./db-cache";

export type SyncStepResult = "ok" | "fail" | "rate_limited";

export function isRateLimitError(err: unknown): boolean {
  if (err instanceof SportsApiError && err.status === 429) return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /rate limit|quota exceeded|429|MONTHLY quota|Too many requests/i.test(msg);
}

export function isMonthlyQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /MONTHLY quota/i.test(msg);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncEndpoint(
  cacheKey: string,
  path: string,
  errors: string[],
  delayMs = 1500
): Promise<SyncStepResult> {
  try {
    const raw = await cricbuzzFetch<unknown>(path);
    await setSportsDbCache(cacheKey, path, raw);
    await sleep(delayMs);
    return "ok";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`${cacheKey}: ${msg.slice(0, 120)}`);
    if (isRateLimitError(err)) return "rate_limited";
    return "fail";
  }
}

export { rebuildPlayerIndexFromCache } from "./sync-helpers";
