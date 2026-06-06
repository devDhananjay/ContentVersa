import { isSportsApiConfigured } from "./cricbuzz-client";
import { SPORTS_CACHE } from "./cache-keys";
import {
  getSportsDbCache,
  logSportsSyncRun,
  setSportsDbCache,
} from "./db-cache";
import {
  isRateLimitError,
  syncEndpoint,
  type SyncStepResult,
} from "./sync-shared";
import { rebuildPlayerIndexFromCache } from "./sync-helpers";
import {
  parseMatchesResponse,
  parseNewsIndex,
  parseSeriesList,
  parseTeamPlayers,
  parseTeamsList,
  parseTrendingPlayers,
} from "./transformers";

const BOOTSTRAP_CURSOR_KEY = "sports:sync:bootstrap-cursor";
const COOLDOWN_KEY = "sports:sync:cooldown";
const SYNC_DELAY_MS = Number(process.env.SPORTS_SYNC_DELAY_MS ?? 1500);
const HOURLY_WAIT_MS = Number(process.env.SPORTS_BOOTSTRAP_WAIT_MS ?? 3_700_000);

const STATIC_ENDPOINTS = [
  { key: SPORTS_CACHE.live.key, path: "/matches/v1/live" },
  { key: SPORTS_CACHE.upcoming.key, path: "/matches/v1/upcoming" },
  { key: SPORTS_CACHE.recent.key, path: "/matches/v1/recent" },
  { key: SPORTS_CACHE.news.key, path: "/news/v1/index" },
  { key: SPORTS_CACHE.schedule.key, path: "/schedule/v1/international" },
  { key: SPORTS_CACHE.teams.key, path: "/teams/v1/international" },
  { key: SPORTS_CACHE.series.key, path: "/series/v1/international" },
  {
    key: SPORTS_CACHE.rankings("test").key,
    path: "/stats/v1/rankings/batsmen?formatType=test",
  },
  {
    key: SPORTS_CACHE.rankings("odi").key,
    path: "/stats/v1/rankings/batsmen?formatType=odi",
  },
  {
    key: SPORTS_CACHE.rankings("t20").key,
    path: "/stats/v1/rankings/batsmen?formatType=t20",
  },
  {
    key: SPORTS_CACHE.trendingPlayers.key,
    path: "/stats/v1/player/trending",
  },
];

interface BootstrapCursor {
  phase: 1 | 2;
  index: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values.filter((n) => Number.isFinite(n) && n > 0))];
}

function collectMatchIds(raw: unknown): number[] {
  if (!raw) return [];
  return uniqueNumbers(parseMatchesResponse(raw).map((m) => m.id));
}

function dedupeEndpoints(
  endpoints: { key: string; path: string }[]
): { key: string; path: string }[] {
  const seen = new Set<string>();
  return endpoints.filter((ep) => {
    if (seen.has(ep.key)) return false;
    seen.add(ep.key);
    return true;
  });
}

async function buildDynamicEndpoints(): Promise<{ key: string; path: string }[]> {
  const endpoints: { key: string; path: string }[] = [];

  const liveRaw = await getSportsDbCache(SPORTS_CACHE.live.key);
  const upcomingRaw = await getSportsDbCache(SPORTS_CACHE.upcoming.key);
  const recentRaw = await getSportsDbCache(SPORTS_CACHE.recent.key);
  const newsRaw = await getSportsDbCache(SPORTS_CACHE.news.key);
  const seriesRaw = await getSportsDbCache(SPORTS_CACHE.series.key);
  const teamsRaw = await getSportsDbCache(SPORTS_CACHE.teams.key);
  const trendingRaw = await getSportsDbCache(SPORTS_CACHE.trendingPlayers.key);

  const matchIds = uniqueNumbers(
    [
      ...collectMatchIds(liveRaw),
      ...collectMatchIds(upcomingRaw),
      ...collectMatchIds(recentRaw),
    ].slice(0, 25)
  );

  for (const id of matchIds) {
    endpoints.push(
      { key: SPORTS_CACHE.matchDetail(id).key, path: `/mcenter/v1/${id}` },
      {
        key: SPORTS_CACHE.matchScorecard(id).key,
        path: `/mcenter/v1/${id}/scard`,
      },
      {
        key: SPORTS_CACHE.matchCommentary(id).key,
        path: `/mcenter/v1/${id}/comm`,
      }
    );
  }

  if (newsRaw) {
    for (const id of uniqueNumbers(
      parseNewsIndex(newsRaw).slice(0, 20).map((n) => n.id)
    )) {
      endpoints.push({
        key: SPORTS_CACHE.newsDetail(id).key,
        path: `/news/v1/detail/${id}`,
      });
    }
  }

  if (seriesRaw) {
    const seriesIds = uniqueNumbers(
      parseSeriesList(seriesRaw).map((s) => s.id)
    ).slice(0, 15);

    const upcomingMatches = upcomingRaw ? parseMatchesResponse(upcomingRaw) : [];
    const extraSeriesIds = uniqueNumbers(upcomingMatches.map((m) => m.seriesId));
    const allSeriesIds = uniqueNumbers([...seriesIds, ...extraSeriesIds]).slice(
      0,
      15
    );

    for (const seriesId of allSeriesIds) {
      endpoints.push(
        {
          key: SPORTS_CACHE.seriesDetail(seriesId).key,
          path: `/series/v1/${seriesId}`,
        },
        {
          key: SPORTS_CACHE.seriesSquads(seriesId).key,
          path: `/series/v1/${seriesId}/squads`,
        },
        {
          key: SPORTS_CACHE.pointsTable(seriesId).key,
          path: `/stats/v1/series/${seriesId}/points-table`,
        },
        {
          key: SPORTS_CACHE.seriesNews(seriesId).key,
          path: `/news/v1/series/${seriesId}`,
        }
      );
    }
  }

  if (teamsRaw) {
    for (const teamId of uniqueNumbers(parseTeamsList(teamsRaw).map((t) => t.id))) {
      endpoints.push(
        {
          key: SPORTS_CACHE.teamPlayers(teamId).key,
          path: `/teams/v1/${teamId}/players`,
        },
        {
          key: SPORTS_CACHE.teamSchedule(teamId).key,
          path: `/teams/v1/${teamId}/schedule`,
        },
        {
          key: SPORTS_CACHE.teamResults(teamId).key,
          path: `/teams/v1/${teamId}/results`,
        }
      );
    }
  }

  if (trendingRaw) {
    for (const p of parseTrendingPlayers(trendingRaw).slice(0, 15)) {
      endpoints.push(
        {
          key: SPORTS_CACHE.playerProfile(p.id).key,
          path: `/stats/v1/player/${p.id}`,
        },
        {
          key: SPORTS_CACHE.playerBatting(p.id).key,
          path: `/stats/v1/player/${p.id}/batting`,
        },
        {
          key: SPORTS_CACHE.playerBowling(p.id).key,
          path: `/stats/v1/player/${p.id}/bowling`,
        },
        {
          key: SPORTS_CACHE.playerNews(p.id).key,
          path: `/news/v1/player/${p.id}`,
        }
      );
    }
  }

  if (teamsRaw) {
    for (const team of parseTeamsList(teamsRaw)) {
      const playersRaw = await getSportsDbCache(
        SPORTS_CACHE.teamPlayers(team.id).key
      );
      if (!playersRaw) continue;
      for (const p of parseTeamPlayers(playersRaw).slice(0, 20)) {
        endpoints.push({
          key: SPORTS_CACHE.playerProfile(p.id).key,
          path: `/stats/v1/player/${p.id}`,
        });
      }
    }
  }

  return dedupeEndpoints(endpoints);
}

async function getBootstrapCursor(): Promise<BootstrapCursor> {
  const row = await getSportsDbCache<BootstrapCursor>(BOOTSTRAP_CURSOR_KEY);
  return row ?? { phase: 1, index: 0 };
}

async function setBootstrapCursor(cursor: BootstrapCursor): Promise<void> {
  await setSportsDbCache(BOOTSTRAP_CURSOR_KEY, "meta", cursor);
}

async function clearBootstrapState(): Promise<void> {
  await setSportsDbCache(COOLDOWN_KEY, "meta", { until: new Date(0).toISOString() });
}

async function syncQueue(
  queue: { key: string; path: string }[],
  startIndex: number,
  force: boolean,
  waitOnRateLimit: boolean,
  errors: string[],
  stats: { synced: number; skipped: number },
  onProgress?: (index: number) => Promise<void>
): Promise<{ nextIndex: number; complete: boolean; rateLimited: boolean }> {
  let index = startIndex;

  while (index < queue.length) {
    const ep = queue[index];

    if (!force) {
      const existing = await getSportsDbCache(ep.key);
      if (existing !== null) {
        stats.skipped += 1;
        index += 1;
        await onProgress?.(index);
        continue;
      }
    }

    const result: SyncStepResult = await syncEndpoint(
      ep.key,
      ep.path,
      errors,
      SYNC_DELAY_MS
    );

    if (result === "ok") {
      stats.synced += 1;
      index += 1;
      await onProgress?.(index);
      continue;
    }

    if (result === "rate_limited") {
      await onProgress?.(index);
      if (waitOnRateLimit) {
        console.info(
          `[sports bootstrap] rate limit — waiting ${Math.round(HOURLY_WAIT_MS / 60000)} min then resuming at ${index}/${queue.length}…`
        );
        await sleep(HOURLY_WAIT_MS);
        await clearBootstrapState();
        continue;
      }
      return { nextIndex: index, complete: false, rateLimited: true };
    }

    index += 1;
    await onProgress?.(index);
  }

  return { nextIndex: index, complete: true, rateLimited: false };
}

export interface BootstrapSyncResult {
  ok: boolean;
  synced: number;
  skipped: number;
  total: number;
  errors: string[];
  durationMs: number;
  complete: boolean;
}

export async function syncSportsBootstrap(options?: {
  force?: boolean;
  waitOnRateLimit?: boolean;
}): Promise<BootstrapSyncResult> {
  const started = Date.now();
  const errors: string[] = [];
  const stats = { synced: 0, skipped: 0 };
  const force = options?.force ?? process.env.SPORTS_BOOTSTRAP_FORCE === "1";
  const waitOnRateLimit = options?.waitOnRateLimit ?? true;

  if (!isSportsApiConfigured()) {
    return {
      ok: false,
      synced: 0,
      skipped: 0,
      total: 0,
      errors: ["RAPIDAPI_KEY is not configured"],
      durationMs: Date.now() - started,
      complete: false,
    };
  }

  await clearBootstrapState();

  let cursor = await getBootstrapCursor();
  let phase = cursor.phase;
  let index = cursor.index;

  // Phase 1 — static lists (teams, series, matches, rankings, etc.)
  if (phase === 1) {
    const staticResult = await syncQueue(
      STATIC_ENDPOINTS,
      index,
      force,
      waitOnRateLimit,
      errors,
      stats,
      async (i) => setBootstrapCursor({ phase: 1, index: i })
    );
    index = staticResult.nextIndex;

    if (!staticResult.complete) {
      await setBootstrapCursor({ phase: 1, index });
      await rebuildPlayerIndexFromCache();
      return finishBootstrap(started, stats, errors, false, STATIC_ENDPOINTS.length);
    }

    phase = 2;
    index = 0;
  }

  // Phase 2 — dynamic detail endpoints (built after static data is in DB)
  const dynamicQueue = await buildDynamicEndpoints();
  const dynamicResult = await syncQueue(
    dynamicQueue,
    index,
    force,
    waitOnRateLimit,
    errors,
    stats,
    async (i) => setBootstrapCursor({ phase: 2, index: i })
  );

  const complete = dynamicResult.complete;
  if (complete) {
    await setBootstrapCursor({ phase: 1, index: 0 });
  } else {
    await setBootstrapCursor({ phase: 2, index: dynamicResult.nextIndex });
  }

  await rebuildPlayerIndexFromCache();

  return finishBootstrap(
    started,
    stats,
    errors,
    complete,
    STATIC_ENDPOINTS.length + dynamicQueue.length
  );
}

async function finishBootstrap(
  started: number,
  stats: { synced: number; skipped: number },
  errors: string[],
  complete: boolean,
  total: number
): Promise<BootstrapSyncResult> {
  const durationMs = Date.now() - started;
  await logSportsSyncRun({
    status: complete ? "success" : stats.synced > 0 ? "partial" : "failed",
    endpoints: stats.synced,
    errors,
    durationMs,
  });

  return {
    ok: stats.synced > 0 || complete,
    synced: stats.synced,
    skipped: stats.skipped,
    total,
    errors,
    durationMs,
    complete,
  };
}

export async function getBootstrapQueueSize(): Promise<number> {
  const dynamic = await buildDynamicEndpoints();
  return STATIC_ENDPOINTS.length + dynamic.length;
}

export { isRateLimitError };
