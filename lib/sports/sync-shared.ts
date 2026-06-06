import { SportsApiError, cricbuzzFetch } from "./cricbuzz-client";
import { setSportsDbCache } from "./db-cache";
import { canMakeApiCall, markMonthlyQuotaExhausted, recordApiCall } from "./quota";

export type SyncStepResult =
  | "ok"
  | "fail"
  | "rate_limited"
  | "quota_exhausted";

export function isRateLimitError(err: unknown): boolean {
  if (err instanceof SportsApiError && err.status === 429) return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /rate limit|quota exceeded|429|Too many requests/i.test(msg);
}

export function isMonthlyQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /MONTHLY quota|monthly.*limit|hard limit/i.test(msg);
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
  if (!(await canMakeApiCall())) {
    errors.push(`${cacheKey}: monthly/hourly API quota exhausted`);
    return "quota_exhausted";
  }

  try {
    const raw = await cricbuzzFetch<unknown>(path);
    await recordApiCall();
    await setSportsDbCache(cacheKey, path, raw);
    await sleep(delayMs);
    return "ok";
  } catch (err) {
    await recordApiCall();
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`${cacheKey}: ${msg.slice(0, 120)}`);
    if (isMonthlyQuotaError(err)) {
      await markMonthlyQuotaExhausted();
      return "quota_exhausted";
    }
    if (isRateLimitError(err)) return "rate_limited";
    return "fail";
  }
}

export { rebuildPlayerIndexFromCache } from "./sync-helpers";
