import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { isSportsApiConfigured } from "./cricbuzz-client";
import {
  deleteSportsDbCache,
  isSportsDbReady,
  setSportsDbCache,
} from "./db-cache";
import { syncSportsData } from "./sync";

const SYNC_LOCK_KEY = "sports:sync:lock";
const DEFAULT_INTERVAL_MS = 4 * 3600 * 1000;
const STARTUP_DELAY_MS = 15_000;
const LOCK_TTL_MS = 45 * 60 * 1000;

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let startupScheduled = false;
let syncInProgress = false;

export function isSportsAutoSyncEnabled(): boolean {
  if (process.env.SPORTS_AUTO_SYNC === "0") return false;
  return (
    isDatabaseConfigured() &&
    process.env.SPORTS_DISABLE_DB_CACHE !== "1" &&
    isSportsApiConfigured()
  );
}

async function getLastSuccessfulSyncAt(): Promise<Date | null> {
  if (!(await isSportsDbReady())) return null;
  try {
    const run = await prisma.sportsSyncRun.findFirst({
      where: { status: { in: ["success", "partial"] } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    return run?.createdAt ?? null;
  } catch {
    return null;
  }
}

export async function isSportsSyncDue(): Promise<boolean> {
  const intervalMs = Number(
    process.env.SPORTS_SYNC_INTERVAL_MS ?? DEFAULT_INTERVAL_MS
  );
  const last = await getLastSuccessfulSyncAt();
  if (!last) return true;
  return Date.now() - last.getTime() >= intervalMs;
}

async function isSyncLocked(): Promise<boolean> {
  if (!(await isSportsDbReady())) return false;
  try {
    const row = await prisma.sportsApiCache.findUnique({
      where: { cacheKey: SYNC_LOCK_KEY },
      select: { payload: true },
    });
    if (!row?.payload || typeof row.payload !== "object") return false;
    const lockedAt = (row.payload as { lockedAt?: string }).lockedAt;
    if (!lockedAt) return false;
    return Date.now() - new Date(lockedAt).getTime() < LOCK_TTL_MS;
  } catch {
    return false;
  }
}

async function acquireSyncLock(): Promise<boolean> {
  if (!(await isSportsDbReady())) return false;
  if (await isSyncLocked()) return false;
  return setSportsDbCache(SYNC_LOCK_KEY, "sync-lock", {
    lockedAt: new Date().toISOString(),
  });
}

async function releaseSyncLock(): Promise<void> {
  await deleteSportsDbCache(SYNC_LOCK_KEY);
}

/**
 * Fire-and-forget sports sync. Safe to call from requests; deduped globally.
 */
export function scheduleSportsSync(reason = "scheduled"): void {
  if (!isSportsAutoSyncEnabled()) return;
  void runSportsSyncIfNeeded(reason);
}

async function runSportsSyncIfNeeded(reason: string): Promise<void> {
  if (syncInProgress) return;
  if (!(await isSportsDbReady())) return;

  const force = reason === "startup";
  if (!force && !(await isSportsSyncDue())) return;

  syncInProgress = true;
  try {
    const locked = await acquireSyncLock();
    if (!locked) return;

    console.info(`[sports auto-sync] starting (${reason})`);
    const result = await syncSportsData();
    console.info(
      `[sports auto-sync] ${result.status} — ${result.endpoints} endpoints (${result.durationMs}ms)`
    );
  } catch (err) {
    console.error("[sports auto-sync] failed", err);
  } finally {
    syncInProgress = false;
    await releaseSyncLock();
  }
}

/**
 * Starts hourly auto-sync when the Node server boots (standalone / EC2).
 */
export function startSportsAutoSync(): void {
  if (!isSportsAutoSyncEnabled() || startupScheduled) return;
  startupScheduled = true;

  const intervalMs = Number(
    process.env.SPORTS_SYNC_INTERVAL_MS ?? DEFAULT_INTERVAL_MS
  );

  setTimeout(() => {
    scheduleSportsSync("startup");
  }, STARTUP_DELAY_MS);

  intervalHandle = setInterval(() => {
    scheduleSportsSync("interval");
  }, intervalMs);

  if (typeof intervalHandle.unref === "function") {
    intervalHandle.unref();
  }

  console.info(
    `[sports auto-sync] enabled — every ${Math.round(intervalMs / 60000)} min, max ${process.env.SPORTS_SYNC_MAX_CALLS ?? 1} API call(s)/run (Basic plan: 200/month)`
  );
}

export function stopSportsAutoSync(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
  startupScheduled = false;
}
