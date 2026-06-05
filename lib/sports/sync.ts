import { cricbuzzFetch, isSportsApiConfigured } from "./cricbuzz-client";
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

const SYNC_DELAY_MS = Number(process.env.SPORTS_SYNC_DELAY_MS ?? 250);
const MAX_PLAYER_DETAILS_PER_RUN = Number(
  process.env.SPORTS_SYNC_MAX_PLAYERS ?? 80
);
const MAX_NEWS_DETAILS = 15;
const MAX_SERIES_DETAILS = 12;
const MAX_LIVE_MATCH_DETAILS = 20;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function syncEndpoint(
  cacheKey: string,
  path: string,
  errors: string[]
): Promise<boolean> {
  try {
    const raw = await cricbuzzFetch<unknown>(path);
    await setSportsDbCache(cacheKey, path, raw);
    await sleep(SYNC_DELAY_MS);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`${cacheKey}: ${msg}`);
    return false;
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

function collectSeriesIds(raw: unknown): number[] {
  if (!raw) return [];
  return uniqueNumbers(parseSeriesList(raw).map((s) => s.id));
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

function collectPlayerIdsFromTeams(...teamPlayerRaws: unknown[]): number[] {
  const ids: number[] = [];
  for (const raw of teamPlayerRaws) {
    if (!raw) continue;
    parseTeamPlayers(raw).forEach((p) => ids.push(p.id));
  }
  return uniqueNumbers(ids);
}

function collectTrendingPlayerIds(raw: unknown): number[] {
  if (!raw) return [];
  return uniqueNumbers(parseTrendingPlayers(raw).map((p) => p.id));
}

function buildPlayerSearchIndex(
  rosterEntries: PlayerSearchResult[]
): PlayerSearchResult[] {
  const seen = new Set<number>();
  const index: PlayerSearchResult[] = [];

  for (const entry of rosterEntries) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    index.push(entry);
  }

  return index.sort((a, b) => a.name.localeCompare(b.name));
}

async function syncPlayerDetails(
  playerIds: number[],
  errors: string[],
  synced: { count: number }
) {
  const oneHourAgo = Date.now() - 3600 * 1000;
  const staleIds: number[] = [];

  for (const id of playerIds) {
    const profileKey = SPORTS_CACHE.playerProfile(id).key;
    const syncedAt = await getSportsCacheSyncedAt(profileKey);
    if (!syncedAt || syncedAt.getTime() < oneHourAgo) {
      staleIds.push(id);
    }
  }

  let queue = staleIds.slice(0, MAX_PLAYER_DETAILS_PER_RUN);

  if (!queue.length && playerIds.length) {
    const offsetRaw = await getSportsDbCache<{ offset: number }>(
      "sports:sync:player-offset"
    );
    const offset = offsetRaw?.offset ?? 0;
    const slice = playerIds.slice(offset, offset + MAX_PLAYER_DETAILS_PER_RUN);
    if (!slice.length) {
      await setSportsDbCache("sports:sync:player-offset", "meta", {
        offset: MAX_PLAYER_DETAILS_PER_RUN,
      });
      queue = playerIds.slice(0, MAX_PLAYER_DETAILS_PER_RUN);
    } else {
      queue = slice;
      await setSportsDbCache("sports:sync:player-offset", "meta", {
        offset: offset + slice.length,
      });
    }
  }

  for (const id of queue) {
    const endpoints = [
      {
        key: SPORTS_CACHE.playerProfile(id).key,
        path: `/stats/v1/player/${id}`,
      },
      {
        key: SPORTS_CACHE.playerBatting(id).key,
        path: `/stats/v1/player/${id}/batting`,
      },
      {
        key: SPORTS_CACHE.playerBowling(id).key,
        path: `/stats/v1/player/${id}/bowling`,
      },
      {
        key: SPORTS_CACHE.playerNews(id).key,
        path: `/news/v1/player/${id}`,
      },
    ];

    for (const ep of endpoints) {
      if (await syncEndpoint(ep.key, ep.path, errors)) synced.count++;
    }
  }
}

export interface SportsSyncResult {
  ok: boolean;
  status: "success" | "partial" | "failed";
  endpoints: number;
  errors: string[];
  durationMs: number;
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

  const globalEndpoints = [
    { key: SPORTS_CACHE.live.key, path: "/matches/v1/live" },
    { key: SPORTS_CACHE.upcoming.key, path: "/matches/v1/upcoming" },
    { key: SPORTS_CACHE.recent.key, path: "/matches/v1/recent" },
    { key: SPORTS_CACHE.news.key, path: "/news/v1/index" },
    { key: SPORTS_CACHE.series.key, path: "/series/v1/international" },
    { key: SPORTS_CACHE.schedule.key, path: "/schedule/v1/international" },
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
    { key: SPORTS_CACHE.teams.key, path: "/teams/v1/international" },
  ];

  for (const ep of globalEndpoints) {
    if (await syncEndpoint(ep.key, ep.path, errors)) synced.count++;
  }

  const liveRaw = await getSportsDbCache(SPORTS_CACHE.live.key);
  const upcomingRaw = await getSportsDbCache(SPORTS_CACHE.upcoming.key);
  const recentRaw = await getSportsDbCache(SPORTS_CACHE.recent.key);
  const newsRaw = await getSportsDbCache(SPORTS_CACHE.news.key);
  const seriesRaw = await getSportsDbCache(SPORTS_CACHE.series.key);
  const teamsRaw = await getSportsDbCache(SPORTS_CACHE.teams.key);
  const trendingRaw = await getSportsDbCache(SPORTS_CACHE.trendingPlayers.key);

  const matchIds = collectMatchIds(liveRaw, upcomingRaw, recentRaw).slice(
    0,
    MAX_LIVE_MATCH_DETAILS
  );
  for (const id of matchIds) {
    const endpoints = [
      { key: SPORTS_CACHE.matchDetail(id).key, path: `/mcenter/v1/${id}` },
      {
        key: SPORTS_CACHE.matchScorecard(id).key,
        path: `/mcenter/v1/${id}/scard`,
      },
      {
        key: SPORTS_CACHE.matchCommentary(id).key,
        path: `/mcenter/v1/${id}/comm`,
      },
    ];
    for (const ep of endpoints) {
      if (await syncEndpoint(ep.key, ep.path, errors)) synced.count++;
    }
  }

  const newsIds = collectNewsIds(newsRaw);
  for (const id of newsIds) {
    const key = SPORTS_CACHE.newsDetail(id).key;
    if (await syncEndpoint(key, `/news/v1/detail/${id}`, errors)) synced.count++;
  }

  const seriesIds = collectSeriesIds(seriesRaw).slice(0, MAX_SERIES_DETAILS);
  const upcomingMatches = upcomingRaw ? parseMatchesResponse(upcomingRaw) : [];
  const pointsSeriesIds = uniqueNumbers([
    ...seriesIds,
    ...upcomingMatches.map((m) => m.seriesId),
  ]).slice(0, MAX_SERIES_DETAILS);

  for (const seriesId of pointsSeriesIds) {
    const endpoints = [
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
      },
    ];
    for (const ep of endpoints) {
      if (await syncEndpoint(ep.key, ep.path, errors)) synced.count++;
    }

    const squadsRaw = await getSportsDbCache(
      SPORTS_CACHE.seriesSquads(seriesId).key
    );
    const squadList = (squadsRaw as { squad?: { squadId?: number }[] })?.squad;
    if (Array.isArray(squadList)) {
      for (const squad of squadList.slice(0, 4)) {
        const squadId = Number(squad.squadId);
        if (!squadId) continue;
        const key = SPORTS_CACHE.seriesSquadPlayers(seriesId, squadId).key;
        if (
          await syncEndpoint(
            key,
            `/series/v1/${seriesId}/squads/${squadId}`,
            errors
          )
        ) {
          synced.count++;
        }
      }
    }
  }

  const teamIds = collectTeamIds(teamsRaw);
  const rosterEntries: PlayerSearchResult[] = [];
  const teamPlayerRaws: unknown[] = [];

  for (const teamId of teamIds) {
    const teamEndpoints = [
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
      },
    ];
    for (const ep of teamEndpoints) {
      if (await syncEndpoint(ep.key, ep.path, errors)) synced.count++;
    }

    const playersRaw = await getSportsDbCache(
      SPORTS_CACHE.teamPlayers(teamId).key
    );
    if (playersRaw) {
      teamPlayerRaws.push(playersRaw);
      const team = teamsRaw ? parseTeamsList(teamsRaw).find((t) => t.id === teamId) : null;
      const teamName = team?.name ?? "";
      parseTeamPlayers(playersRaw).forEach((p) => {
        rosterEntries.push({
          id: p.id,
          name: p.name,
          teamName,
          faceImageId: p.imageId,
        });
      });
    }
  }

  if (trendingRaw) {
    for (const p of parseTrendingPlayers(trendingRaw)) {
      rosterEntries.push({
        id: p.id,
        name: p.name,
        teamName: p.teamName,
        faceImageId: p.faceImageId,
      });
    }
  }

  const allPlayerIds = uniqueNumbers([
    ...collectPlayerIdsFromTeams(...teamPlayerRaws),
    ...collectTrendingPlayerIds(trendingRaw),
  ]);

  await syncPlayerDetails(allPlayerIds, errors, synced);

  const playerIndex = buildPlayerSearchIndex(rosterEntries);
  await setSportsDbCache(
    SPORTS_CACHE.playerIndex.key,
    "local:players-index",
    playerIndex
  );
  synced.count++;

  const durationMs = Date.now() - started;
  const status: SportsSyncResult["status"] =
    errors.length === 0
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
  };
}
