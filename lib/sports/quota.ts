import { getSportsDbCache, setSportsDbCache } from "./db-cache";

const QUOTA_KEY = "sports:sync:api-quota";

/** RapidAPI Basic: 200 requests/month (hard limit). */
export const MONTHLY_API_LIMIT = Number(
  process.env.SPORTS_MONTHLY_API_LIMIT ?? 200
);

/** RapidAPI Basic: 1000 requests/hour. */
export const HOURLY_API_LIMIT = Number(process.env.SPORTS_HOURLY_API_LIMIT ?? 1000);

interface QuotaState {
  month: string;
  monthCount: number;
  hour: string;
  hourCount: number;
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function currentHour(): string {
  return new Date().toISOString().slice(0, 13);
}

async function loadQuotaState(): Promise<QuotaState> {
  const row = await getSportsDbCache<QuotaState>(QUOTA_KEY);
  const month = currentMonth();
  const hour = currentHour();

  if (!row) {
    return { month, monthCount: 0, hour, hourCount: 0 };
  }

  return {
    month: row.month === month ? row.month : month,
    monthCount: row.month === month ? row.monthCount : 0,
    hour: row.hour === hour ? row.hour : hour,
    hourCount: row.hour === hour ? row.hourCount : 0,
  };
}

async function saveQuotaState(state: QuotaState): Promise<void> {
  await setSportsDbCache(QUOTA_KEY, "meta:api-quota", state);
}

export interface QuotaStatus {
  monthUsed: number;
  monthLimit: number;
  monthRemaining: number;
  hourUsed: number;
  hourLimit: number;
  hourRemaining: number;
  monthExhausted: boolean;
  hourExhausted: boolean;
}

export async function getQuotaStatus(): Promise<QuotaStatus> {
  const state = await loadQuotaState();
  const monthRemaining = Math.max(0, MONTHLY_API_LIMIT - state.monthCount);
  const hourRemaining = Math.max(0, HOURLY_API_LIMIT - state.hourCount);

  return {
    monthUsed: state.monthCount,
    monthLimit: MONTHLY_API_LIMIT,
    monthRemaining,
    hourUsed: state.hourCount,
    hourLimit: HOURLY_API_LIMIT,
    hourRemaining,
    monthExhausted: monthRemaining <= 0,
    hourExhausted: hourRemaining <= 0,
  };
}

/** Call before each RapidAPI request. Returns false when quota is exhausted. */
export async function canMakeApiCall(): Promise<boolean> {
  const status = await getQuotaStatus();
  return !status.monthExhausted && !status.hourExhausted;
}

/** Record one API request (success or rate-limited — both count against quota). */
export async function recordApiCall(): Promise<QuotaStatus> {
  const state = await loadQuotaState();
  state.monthCount += 1;
  state.hourCount += 1;
  await saveQuotaState(state);
  return getQuotaStatus();
}

export function formatQuotaMessage(status: QuotaStatus): string {
  return `${status.monthUsed}/${status.monthLimit} monthly, ${status.hourUsed}/${status.hourLimit} this hour`;
}
