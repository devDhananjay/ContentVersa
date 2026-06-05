import { Prisma } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

let tablesMissingLogged = false;
let tablesReadyCache: boolean | null = null;

function isMissingTableError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021"
  );
}

function logMissingTablesOnce(): void {
  if (tablesMissingLogged) return;
  tablesMissingLogged = true;
  console.warn(
    "[sports] Database tables missing. Run: npm run db:push"
  );
}

/** True when SportsApiCache exists and is usable. */
export async function isSportsDbReady(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  if (tablesReadyCache === true) return true;
  if (tablesReadyCache === false) return false;

  try {
    await prisma.sportsApiCache.findFirst({ select: { id: true } });
    tablesReadyCache = true;
    return true;
  } catch (err) {
    if (isMissingTableError(err)) {
      tablesReadyCache = false;
      logMissingTablesOnce();
      return false;
    }
    return false;
  }
}

export async function getSportsDbCache<T = unknown>(
  cacheKey: string
): Promise<T | null> {
  if (!isDatabaseConfigured()) return null;
  if (!(await isSportsDbReady())) return null;
  try {
    const row = await prisma.sportsApiCache.findUnique({
      where: { cacheKey },
    });
    if (!row) return null;
    return row.payload as T;
  } catch (err) {
    if (isMissingTableError(err)) {
      tablesReadyCache = false;
      logMissingTablesOnce();
      return null;
    }
    console.error("[sports db-cache] read failed", cacheKey, err);
    return null;
  }
}

export async function setSportsDbCache(
  cacheKey: string,
  endpoint: string,
  payload: unknown
): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  if (!(await isSportsDbReady())) return false;
  const now = new Date();
  try {
    await prisma.sportsApiCache.upsert({
      where: { cacheKey },
      create: {
        cacheKey,
        endpoint,
        payload: payload as object,
        syncedAt: now,
      },
      update: {
        endpoint,
        payload: payload as object,
        syncedAt: now,
      },
    });
    return true;
  } catch (err) {
    if (isMissingTableError(err)) {
      tablesReadyCache = false;
      logMissingTablesOnce();
      return false;
    }
    console.error("[sports db-cache] write failed", cacheKey, err);
    return false;
  }
}

export async function getSportsCacheSyncedAt(
  cacheKey: string
): Promise<Date | null> {
  if (!(await isSportsDbReady())) return null;
  try {
    const row = await prisma.sportsApiCache.findUnique({
      where: { cacheKey },
      select: { syncedAt: true },
    });
    return row?.syncedAt ?? null;
  } catch {
    return null;
  }
}

export async function logSportsSyncRun(input: {
  status: "success" | "partial" | "failed";
  endpoints: number;
  errors: string[];
  durationMs: number;
}): Promise<void> {
  if (!(await isSportsDbReady())) return;
  try {
    await prisma.sportsSyncRun.create({
      data: {
        status: input.status,
        endpoints: input.endpoints,
        errors: input.errors,
        durationMs: input.durationMs,
      },
    });
  } catch (err) {
    if (!isMissingTableError(err)) {
      console.error("[sports sync] failed to log run", err);
    }
  }
}

export async function deleteSportsDbCache(cacheKey: string): Promise<void> {
  if (!(await isSportsDbReady())) return;
  try {
    await prisma.sportsApiCache.delete({ where: { cacheKey } });
  } catch {
    /* row may not exist */
  }
}
