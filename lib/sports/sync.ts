import { SportsApiError, cricbuzzFetch, isSportsApiConfigured } from "./cricbuzz-client";
import { SPORTS_CACHE } from "./cache-keys";
import {
  getSportsCacheSyncedAt,
  getSportsDbCache,
  logSportsSyncRun,
  setSportsDbCache,
} from "./db-cache";
import {
  parseMatchesResponse,
  parseNewsIndex,
  parseSeriesList,
  parseTeamPlayers,
  parseTeamsList,
  parseTrendingPlayers,
} from "./transformers";
import type { PlayerSearchResult } from "./types";

const SYNC_DELAY_MS = Number(process.env.SPORTS_SYNC_DELAY_MS ?? 1200);
const MAX_CALLS_PER_RUN = Number(process.env.SPORTS_SYNC_MAX_CALLS ?? 8);
const MAX_PLAYER_DETAILS_PER_RUN = Number(
  process.env.SPORTS_SYNC_MAX_PLAYERS ?? 4
);
const MAX_NEWS_DETAILS = 3;
const MAX_SERIES_DETAILS = 2;
const MAX_LIVE_MATCH_DETAILS = 2;
const MAX_TEAMS_PER_RUN = 2;

const COOLDOWN_KEY = "sports:sync:cooldown";
const CURSOR_KEY = "sports:sync:cursor";

const STATIC_QUEUE: { key: string; path: string }[] = [
  { key: SPORTS_CACHE.live.key, path: "/matches/v1/live" },
  { key: SPORTS_CACHE.upcoming.key, path: "/matches/v1/upcoming" },
  { key: SPORTS_CACHE.recent.key, path: "/matches/v1/recent" },
  { key: SPORTS_CACHE.news.key, path: "/news/v1/index" },
  { key: SPORTS_CACHE.schedule.key, path: "/schedule/v1/international" },
  { key: SPORTS_CACHE.teams.key, path: "/teams/v1/international" },
  { key: SPORTS_CACHE.series.key, path: "/series/v1/international" },
  {
    key: SPORTS_CACHE.rankings("odi").key,
    path: "/stats/v1/rankings/batsmen?formatType=odi",
  },
  {
    key: SPORTS_CACHE.rankings("t20").key,
    path: "/stats/v1/rankings/batsmen?formatType=t20",
  },
  {
    key: SPORTS_CACHE.rankings("test").key,
    path: "/stats/v1/rankings/batsmen?formatType=test",
  },
  {
    key: SPORTS_CACHE.trendingPlayers.key,
    path: "/stats/v1/player/trending",
  },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRateLimitError(err: unknown): boolean {
  if (err instanceof SportsApiError && err.status === 429) return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /rate limit|quota exceeded|429|MONTHLY quota/i.test(msg);
}

export function isMonthlyQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /MONTHLY quota/i.test(msg);
}

async function isInRateLimitCooldown(): Promise<boolean> {
  const row = await getSportsDbCache<{ until?: string }>(COOLDOWN_KEY);
  if (!row?.until) return false;
  return new Date(row.until).getTime() > Date.now();
}

async function setRateLimitCooldown(ms = 3600_000): Promise<void> {
  await setSportsDbCache(COOLDOWN_KEY, "meta", {
    until: new Date(Date.now() + ms).toISOString(),
  });
}

type SyncStepResult = "ok" | "fail" | "rate_limited";

async function syncEndpoint(
  cacheKey: string,
  path: string,
  errors: string[]
): Promise<SyncStepResult> {
  try {
    const raw = await cricbuzzFetch<unknown>(path);
    await setSportsDbCache(cacheKey, path, raw);
    await sleep(SYNC_DELAY_MS);
    return "ok";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`${cacheKey}: ${msg.slice(0, 120)}`);
    if (isRateLimitError(err)) return "rate_limited";
    return "fail";
  }
}

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values.filter((n) => Number.isFinite(n) && n > 0))];
}

function collectMatchIds(...rawLists: unknown[]): number[] {
  const ids: number[] = [];
  for (const raw of rawLists) {
    if (!raw) continue;
    parseMatchesResponse(raw).forEach((m) => ids.push(m.id));
  }
  return uniqueNumbers(ids);
}

function collectNewsIds(raw: unknown): number[] {
  if (!raw) return [];
  return uniqueNumbers(
    parseNewsIndex(raw).slice(0, MAX_NEWS_DETAILS).map((n) => n.id)
  );
}

function collectTeamIds(raw: unknown): number[] {
  if (!raw) return [];
  return uniqueNumbers(parseTeamsList(raw).map((t) => t.id));
}

function collectSeriesIds(raw: unknown): number[] {
  if (!raw) return [];
  return uniqueNumbers(parseSeriesList(raw).map((s) => s.id));
}

async function getSyncCursor(): Promise<number> {
  const row = await getSportsDbCache<{ index?: number }>(CURSOR_KEY);
  return row?.index ?? 0;
}

async function setSyncCursor(index: number): Promise<void> {
  await setSportsDbCache(CURSOR_KEY, "meta", { index });
}

async function syncRotatingStaticQueue(
  errors: string[],
  synced: { count: number }
): Promise<boolean> {
  let cursor = await getSyncCursor();
  let calls = 0;
  let rateLimited = false;

  while (calls < MAX_CALLS_PER_RUN && !rateLimited) {
    const ep = STATIC_QUEUE[cursor % STATIC_QUEUE.length];
    const result = await syncEndpoint(ep.key, ep.path, errors);
    cursor += 1;

    if (result === "ok") {
      synced.count += 1;
      calls += 1;
    } else if (result === "rate_limited") {
      rateLimited = true;
      await setRateLimitCooldown();
    } else {
      calls += 1;
    }
  }

  await setSyncCursor(cursor % STATIC_QUEUE.length);
  return rateLimited;
}

async function syncWithBudget(
  endpoints: { key: string; path: string }[],
  budget: number,
  errors: string[],
  synced: { count: number }
): Promise<boolean> {
  let calls = 0;
  for (const ep of endpoints) {
    if (calls >= budget) break;
    const result = await syncEndpoint(ep.key, ep.path, errors);
    if (result === "ok") {
      synced.count += 1;
      calls += 1;
    } else if (result === "rate_limited") {
      await setRateLimitCooldown();
      return true;
    } else {
      calls += 1;
    }
  }
  return false;
}

async function rebuildPlayerIndexFromCache(): Promise<void> {
  const teamsRaw = await getSportsDbCache(SPORTS_CACHE.teams.key);
  if (!teamsRaw) return;

  const rosterEntries: PlayerSearchResult[] = [];
  const seen = new Set<number>();

  for (const team of parseTeamsList(teamsRaw)) {
    const playersRaw = await getSportsDbCache(
      SPORTS_CACHE.teamPlayers(team.id).key
    );
    if (!playersRaw) continue;
    for (const p of parseTeamPlayers(playersRaw)) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      rosterEntries.push({
        id: p.id,
        name: p.name,
        teamName: team.name,
        faceImageId: p.imageId,
      });
    }
  }

  const trendingRaw = await getSportsDbCache(SPORTS_CACHE.trendingPlayers.key);
  if (trendingRaw) {
    for (const p of parseTrendingPlayers(trendingRaw)) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      rosterEntries.push({
        id: p.id,
        name: p.name,
        teamName: p.teamName,
        faceImageId: p.faceImageId,
      });
    }
  }

  if (!rosterEntries.length) return;

  rosterEntries.sort((a, b) => a.name.localeCompare(b.name));
  await setSportsDbCache(
    SPORTS_CACHE.playerIndex.key,
    "local:players-index",
    rosterEntries
  );
}

async function syncPlayerDetails(
  playerIds: number[],
  budget: number,
  errors: string[],
  synced: { count: number }
): Promise<boolean> {
  const oneHourAgo = Date.now() - 3600 * 1000;
  const staleIds: number[] = [];

  for (const id of playerIds) {
    const syncedAt = await getSportsCacheSyncedAt(
      SPORTS_CACHE.playerProfile(id).key
    );
    if (!syncedAt || syncedAt.getTime() < oneHourAgo) staleIds.push(id);
  }

  const queue = staleIds.slice(0, Math.min(MAX_PLAYER_DETAILS_PER_RUN, budget));
  let calls = 0;

  for (const id of queue) {
    if (calls >= budget) break;
    const endpoints = [
      {
        key: SPORTS_CACHE.playerProfile(id).key,
        path: `/stats/v1/player/${id}`,
      },
    ];

    for (const ep of endpoints) {
      if (calls >= budget) break;
      const result = await syncEndpoint(ep.key, ep.path, errors);
      if (result === "ok") {
        synced.count += 1;
        calls += 1;
      } else if (result === "rate_limited") {
        await setRateLimitCooldown();
        return true;
      } else {
        calls += 1;
      }
    }
  }

  return false;
}

export interface SportsSyncResult {
  ok: boolean;
  status: "success" | "partial" | "failed" | "skipped";
  endpoints: number;
  errors: string[];
  durationMs: number;
  message?: string;
}

export async function syncSportsData(): Promise<SportsSyncResult> {
  const started = Date.now();
  const errors: string[] = [];
  const synced = { count: 0 };

  if (!isSportsApiConfigured()) {
    return {
      ok: false,
      status: "failed",
      endpoints: 0,
      errors: ["RAPIDAPI_KEY is not configured"],
      durationMs: Date.now() - started,
    };
  }

  if (await isInRateLimitCooldown()) {
    await rebuildPlayerIndexFromCache();
    return {
      ok: true,
      status: "skipped",
      endpoints: 0,
      errors: [],
      durationMs: Date.now() - started,
      message:
        "Rate limit cooldown active — using cached DB data. Will retry next hour.",
    };
  }

  const mode = process.env.SPORTS_SYNC_MODE ?? "rotating";
  let rateLimited = false;
  let budget = MAX_CALLS_PER_RUN;

  if (mode === "full") {
    rateLimited = await syncWithBudget(STATIC_QUEUE, budget, errors, synced);
    budget = 0;
  } else {
    rateLimited = await syncRotatingStaticQueue(errors, synced);
    budget = Math.max(0, MAX_CALLS_PER_RUN - synced.count);
  }

  if (!rateLimited && budget > 0 && mode === "full") {
    const liveRaw = await getSportsDbCache(SPORTS_CACHE.live.key);
    const upcomingRaw = await getSportsDbCache(SPORTS_CACHE.upcoming.key);
    const recentRaw = await getSportsDbCache(SPORTS_CACHE.recent.key);
    const newsRaw = await getSportsDbCache(SPORTS_CACHE.news.key);
    const seriesRaw = await getSportsDbCache(SPORTS_CACHE.series.key);
    const teamsRaw = await getSportsDbCache(SPORTS_CACHE.teams.key);

    const matchIds = collectMatchIds(liveRaw, upcomingRaw, recentRaw).slice(
      0,
      MAX_LIVE_MATCH_DETAILS
    );
    const matchEndpoints = matchIds.flatMap((id) => [
      { key: SPORTS_CACHE.matchDetail(id).key, path: `/mcenter/v1/${id}` },
      {
        key: SPORTS_CACHE.matchScorecard(id).key,
        path: `/mcenter/v1/${id}/scard`,
      },
    ]);
    rateLimited = await syncWithBudget(
      matchEndpoints,
      budget,
      errors,
      synced
    );
    budget = Math.max(0, budget - synced.count);

    if (!rateLimited && budget > 0) {
      const newsIds = collectNewsIds(newsRaw);
      const newsEndpoints = newsIds.map((id) => ({
        key: SPORTS_CACHE.newsDetail(id).key,
        path: `/news/v1/detail/${id}`,
      }));
      rateLimited = await syncWithBudget(
        newsEndpoints,
        budget,
        errors,
        synced
      );
    }

    if (!rateLimited && budget > 0 && seriesRaw) {
      const seriesId = collectSeriesIds(seriesRaw)[0];
      if (seriesId) {
        rateLimited = await syncWithBudget(
          [
            {
              key: SPORTS_CACHE.seriesDetail(seriesId).key,
              path: `/series/v1/${seriesId}`,
            },
          ],
          budget,
          errors,
          synced
        );
      }
    }

    if (!rateLimited && budget > 0 && teamsRaw) {
      const teamEndpoints = collectTeamIds(teamsRaw)
        .slice(0, MAX_TEAMS_PER_RUN)
        .flatMap((teamId) => [
          {
            key: SPORTS_CACHE.teamPlayers(teamId).key,
            path: `/teams/v1/${teamId}/players`,
          },
        ]);
      rateLimited = await syncWithBudget(
        teamEndpoints,
        budget,
        errors,
        synced
      );
    }
  }

  await rebuildPlayerIndexFromCache();

  const durationMs = Date.now() - started;
  const status: SportsSyncResult["status"] =
    rateLimited && synced.count === 0
      ? "failed"
      : errors.length === 0
        ? "success"
        : synced.count > 0
          ? "partial"
          : "failed";

  await logSportsSyncRun({
    status,
    endpoints: synced.count,
    errors,
    durationMs,
  });

  return {
    ok: status !== "failed",
    status,
    endpoints: synced.count,
    errors,
    durationMs,
    message: rateLimited
      ? `Rate limit hit after ${synced.count} calls — remaining data syncs on next run.`
      : undefined,
  };
}
