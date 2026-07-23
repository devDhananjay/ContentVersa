import { cache } from "react";
import { cricbuzzFetch, isSportsApiConfigured, SportsApiError } from "./cricbuzz-client";
import { isSportsDbCacheEnabled, readSportsPayload } from "./cache-reader";
import { SPORTS_CACHE } from "./cache-keys";
import {
  parseCommentary,
  parseGroupedMatches,
  parseMatchDetail,
  parseMatchesResponse,
  newsDetailFromIndexItem,
  parseNewsDetail,
  parseNewsIndex,
  parsePlayerProfile,
  parsePlayerSearch,
  parsePlayerStats,
  parsePointsTable,
  parseRankings,
  parseSchedule,
  parseScorecard,
  parseSeriesDetailMeta,
  parseSeriesList,
  parseSeriesSquads,
  scheduleMatchToSportMatch,
  parseTeamPlayers,
  parseTeamsList,
  parseTrendingPlayers,
} from "./transformers";
import type {
  CommentaryItem,
  CricketNewsDetail,
  CricketNewsItem,
  MatchGroup,
  MatchScorecard,
  PlayerProfile,
  PlayerSearchResult,
  PlayerStatsTable,
  PointsTableRow,
  RankingFormat,
  SeriesDetailData,
  SportMatch,
  SportsHubData,
  SportsTeaserData,
  TeamPlayer,
  TeamSummary,
} from "./types";
import { isDatabaseConfigured } from "@/lib/prisma";

export async function getLiveMatches(): Promise<SportMatch[]> {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.live;
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>("/matches/v1/live")
  );
  if (!raw) return [];
  return parseMatchesResponse(raw).filter((m) => m.isLive);
}

export async function getUpcomingMatches(): Promise<SportMatch[]> {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.upcoming;
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>("/matches/v1/upcoming")
  );
  if (!raw) return [];
  return parseMatchesResponse(raw);
}

export async function getRecentMatches(): Promise<SportMatch[]> {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.recent;
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>("/matches/v1/recent")
  );
  if (!raw) return [];
  return parseMatchesResponse(raw);
}

export async function getCricketNews(limit = 12): Promise<CricketNewsItem[]> {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.news;
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>("/news/v1/index")
  );
  if (!raw) return [];
  return parseNewsIndex(raw).slice(0, limit);
}

export async function getCricketNewsDetail(
  id: number
): Promise<CricketNewsDetail | null> {
  if (!Number.isFinite(id) || id <= 0) return null;

  const { key, ttl, staleTtl } = SPORTS_CACHE.newsDetail(id);

  // Prefer cached / live detail payload when available.
  if (isSportsApiConfigured() || isDatabaseConfigured()) {
    const raw = await readSportsPayload(key, ttl, staleTtl, () =>
      cricbuzzFetch<unknown>(`/news/v1/detail/${id}`)
    );
    if (raw) {
      const parsed = parseNewsDetail(raw);
      if (parsed) return parsed;
    }

    // DB-cache mode often only prefetches a few details — try a live hit for
    // articles that are already linked from the news index.
    if (isSportsApiConfigured()) {
      try {
        const live = await cricbuzzFetch<unknown>(`/news/v1/detail/${id}`);
        const parsed = parseNewsDetail(live);
        if (parsed) {
          if (isSportsDbCacheEnabled()) {
            const { setSportsDbCache } = await import("./db-cache");
            await setSportsDbCache(key, "news-detail-live", live);
          }
          return parsed;
        }
      } catch {
        // Fall through to index summary.
      }
    }
  }

  // Last resort: serve headline/intro from the news index so hub links don't 404.
  const fromIndex = (await getCricketNews(40)).find((item) => item.id === id);
  if (fromIndex) return newsDetailFromIndexItem(fromIndex);

  return null;
}

async function findMatchInCachedLists(matchId: number): Promise<SportMatch | null> {
  const [live, upcoming, recent, schedule] = await Promise.all([
    getLiveMatches(),
    getUpcomingMatches(),
    getRecentMatches(),
    getInternationalSchedule(),
  ]);

  const fromFeed = [...live, ...upcoming, ...recent].find((m) => m.id === matchId);
  if (fromFeed) return fromFeed;

  for (const day of schedule) {
    const scheduled = day.matches.find((m) => m.id === matchId);
    if (scheduled) return scheduleMatchToSportMatch(scheduled);
  }

  return null;
}

async function buildSeriesMatchGroupsFromSchedule(
  seriesId: number
): Promise<MatchGroup[]> {
  const schedule = await getInternationalSchedule();
  const groups: MatchGroup[] = [];

  for (const day of schedule) {
    const matches = day.matches
      .filter((m) => m.seriesId === seriesId)
      .map(scheduleMatchToSportMatch);
    if (matches.length) {
      groups.push({ dateLabel: day.dateLabel, matches });
    }
  }

  return groups;
}

export async function getMatchDetail(id: number): Promise<SportMatch | null> {
  if (!isSportsApiConfigured()) return null;
  const { key, ttl, staleTtl } = SPORTS_CACHE.matchDetail(id);
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>(`/mcenter/v1/${id}`)
  );
  if (raw) {
    const parsed = parseMatchDetail(raw);
    if (parsed) return parsed;
  }
  return findMatchInCachedLists(id);
}

export async function getInternationalSeries() {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.series;
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>("/series/v1/international")
  );
  if (!raw) return [];
  return parseSeriesList(raw);
}

export async function getInternationalSchedule() {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.schedule;
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>("/schedule/v1/international")
  );
  if (!raw) return [];
  return parseSchedule(raw);
}

export async function getBatsmanRankings(format: RankingFormat = "odi") {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.rankings(format);
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>(`/stats/v1/rankings/batsmen?formatType=${format}`)
  );
  if (!raw) return [];
  return parseRankings(raw);
}

export async function getTrendingPlayers() {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.trendingPlayers;
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>("/stats/v1/player/trending")
  );
  if (!raw) return [];
  return parseTrendingPlayers(raw);
}

export async function getPointsTable(seriesId: number) {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.pointsTable(seriesId);
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>(`/stats/v1/series/${seriesId}/points-table`)
  );
  if (!raw) return [];
  return parsePointsTable(raw);
}

export async function getMatchCommentary(matchId: number): Promise<CommentaryItem[]> {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.matchCommentary(matchId);
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>(`/mcenter/v1/${matchId}/comm`)
  );
  if (!raw) return [];
  return parseCommentary(raw);
}

export async function getMatchScorecard(matchId: number): Promise<MatchScorecard | null> {
  if (!isSportsApiConfigured()) return null;
  const { key, ttl, staleTtl } = SPORTS_CACHE.matchScorecard(matchId);
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>(`/mcenter/v1/${matchId}/scard`)
  );
  if (!raw) return null;
  const card = parseScorecard(raw);
  return card.innings.length ? card : null;
}

async function resolvePointsTableContext(upcoming: SportMatch[]) {
  const seriesId = upcoming[0]?.seriesId;
  if (!seriesId) return { rows: [] as PointsTableRow[], seriesName: undefined };

  try {
    const rows = await getPointsTable(seriesId);
    return {
      rows,
      seriesName: upcoming[0]?.seriesName,
    };
  } catch {
    return { rows: [] as PointsTableRow[], seriesName: undefined };
  }
}

export async function getSportsHubData(): Promise<SportsHubData> {
  const configured = isSportsApiConfigured();
  if (!configured) {
    return {
      live: [],
      upcoming: [],
      recent: [],
      news: [],
      series: [],
      schedule: [],
      rankings: [],
      rankingsByFormat: {},
      trendingPlayers: [],
      pointsTable: [],
      configured: false,
    };
  }

  const [
    liveResult,
    upcomingResult,
    recentResult,
    newsResult,
    seriesResult,
    scheduleResult,
    rankingsTestResult,
    rankingsOdiResult,
    rankingsT20Result,
    trendingResult,
  ] = await Promise.allSettled([
    getLiveMatches(),
    getUpcomingMatches(),
    getRecentMatches(),
    getCricketNews(12),
    getInternationalSeries(),
    getInternationalSchedule(),
    getBatsmanRankings("test"),
    getBatsmanRankings("odi"),
    getBatsmanRankings("t20"),
    getTrendingPlayers(),
  ]);

  const upcoming =
    upcomingResult.status === "fulfilled" ? upcomingResult.value : [];

  const pointsContext = await resolvePointsTableContext(upcoming);

  return {
    live: liveResult.status === "fulfilled" ? liveResult.value : [],
    upcoming,
    recent: recentResult.status === "fulfilled" ? recentResult.value : [],
    news: newsResult.status === "fulfilled" ? newsResult.value : [],
    series: seriesResult.status === "fulfilled" ? seriesResult.value : [],
    schedule: scheduleResult.status === "fulfilled" ? scheduleResult.value : [],
    rankings:
      rankingsOdiResult.status === "fulfilled" ? rankingsOdiResult.value : [],
    rankingsByFormat: {
      test:
        rankingsTestResult.status === "fulfilled"
          ? rankingsTestResult.value
          : [],
      odi:
        rankingsOdiResult.status === "fulfilled" ? rankingsOdiResult.value : [],
      t20:
        rankingsT20Result.status === "fulfilled"
          ? rankingsT20Result.value
          : [],
    },
    trendingPlayers:
      trendingResult.status === "fulfilled" ? trendingResult.value : [],
    pointsTable: pointsContext.rows,
    pointsTableSeriesName: pointsContext.seriesName,
    configured: true,
  };
}

export const getSportsHubDataCached = cache(getSportsHubData);

export async function getSportsTeaserData(): Promise<SportsTeaserData> {
  const configured = isSportsApiConfigured();
  if (!configured) {
    return { live: [], upcoming: [], news: [], configured: false };
  }

  const [liveResult, upcomingResult, newsResult] = await Promise.allSettled([
    getLiveMatches(),
    getUpcomingMatches(),
    getCricketNews(4),
  ]);

  return {
    live: liveResult.status === "fulfilled" ? liveResult.value.slice(0, 2) : [],
    upcoming:
      upcomingResult.status === "fulfilled"
        ? upcomingResult.value.slice(0, 2)
        : [],
    news: newsResult.status === "fulfilled" ? newsResult.value.slice(0, 3) : [],
    configured: true,
  };
}

export async function getInternationalTeams(): Promise<TeamSummary[]> {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.teams;
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>("/teams/v1/international")
  );
  if (!raw) return [];
  return parseTeamsList(raw);
}

export async function getTeamById(teamId: number): Promise<TeamSummary | null> {
  const teams = await getInternationalTeams();
  return teams.find((t) => t.id === teamId) ?? null;
}

export async function getTeamPlayers(teamId: number): Promise<TeamPlayer[]> {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.teamPlayers(teamId);
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>(`/teams/v1/${teamId}/players`)
  );
  if (!raw) return [];
  return parseTeamPlayers(raw);
}

export async function getTeamSchedule(teamId: number): Promise<MatchGroup[]> {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.teamSchedule(teamId);
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>(`/teams/v1/${teamId}/schedule`)
  );
  if (!raw) return [];
  return parseGroupedMatches(raw, "teamMatchesData");
}

export async function getTeamResults(teamId: number): Promise<MatchGroup[]> {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.teamResults(teamId);
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>(`/teams/v1/${teamId}/results`)
  );
  if (!raw) return [];
  return parseGroupedMatches(raw, "teamMatchesData");
}

export async function searchPlayers(query: string): Promise<PlayerSearchResult[]> {
  const q = query.trim().toLowerCase();
  if (!isSportsApiConfigured() || q.length < 2) return [];

  const { key, ttl, staleTtl } = SPORTS_CACHE.playerIndex;
  const index = await readSportsPayload<PlayerSearchResult[]>(
    key,
    ttl,
    staleTtl,
    async () => []
  );
  if (index?.length) {
    return index
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 20);
  }

  const { key: searchKey, ttl: searchTtl, staleTtl: searchStale } =
    SPORTS_CACHE.playerSearch(q);
  const raw = await readSportsPayload(searchKey, searchTtl, searchStale, () =>
    cricbuzzFetch<unknown>(
      `/stats/v1/player/search?plrN=${encodeURIComponent(q)}`
    )
  );
  if (!raw) return [];
  return parsePlayerSearch(raw);
}

export async function getPlayerProfile(
  playerId: number
): Promise<PlayerProfile | null> {
  if (!isSportsApiConfigured()) return null;
  const { key, ttl, staleTtl } = SPORTS_CACHE.playerProfile(playerId);
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>(`/stats/v1/player/${playerId}`)
  );
  if (!raw) return null;
  return parsePlayerProfile(raw);
}

export async function getPlayerBattingStats(
  playerId: number
): Promise<PlayerStatsTable | null> {
  if (!isSportsApiConfigured()) return null;
  const { key, ttl, staleTtl } = SPORTS_CACHE.playerBatting(playerId);
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>(`/stats/v1/player/${playerId}/batting`)
  );
  if (!raw) return null;
  const stats = parsePlayerStats(raw);
  return stats.headers.length ? stats : null;
}

export async function getPlayerBowlingStats(
  playerId: number
): Promise<PlayerStatsTable | null> {
  if (!isSportsApiConfigured()) return null;
  const { key, ttl, staleTtl } = SPORTS_CACHE.playerBowling(playerId);
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>(`/stats/v1/player/${playerId}/bowling`)
  );
  if (!raw) return null;
  const stats = parsePlayerStats(raw);
  return stats.headers.length ? stats : null;
}

export async function getSeriesDetailData(
  seriesId: number
): Promise<SeriesDetailData | null> {
  if (!isSportsApiConfigured()) return null;

  const { key, ttl, staleTtl } = SPORTS_CACHE.seriesDetail(seriesId);
  const detailRaw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>(`/series/v1/${seriesId}`)
  );

  let seriesName: string;
  let matchGroups: MatchGroup[];

  if (detailRaw) {
    const meta = parseSeriesDetailMeta(detailRaw);
    seriesName = meta.name;
    matchGroups = parseGroupedMatches(detailRaw, "matchDetails");
  } else {
    const seriesList = await getInternationalSeries();
    const listed = seriesList.find((s) => s.id === seriesId);
    if (!listed) return null;
    seriesName = listed.name;
    matchGroups = await buildSeriesMatchGroupsFromSchedule(seriesId);
  }

  const squadsCfg = SPORTS_CACHE.seriesSquads(seriesId);
  const newsCfg = SPORTS_CACHE.seriesNews(seriesId);

  const [squadsResult, pointsResult, newsResult] = await Promise.allSettled([
    readSportsPayload(squadsCfg.key, squadsCfg.ttl, squadsCfg.staleTtl, () =>
      cricbuzzFetch<unknown>(`/series/v1/${seriesId}/squads`)
    ),
    getPointsTable(seriesId),
    readSportsPayload(newsCfg.key, newsCfg.ttl, newsCfg.staleTtl, () =>
      cricbuzzFetch<unknown>(`/news/v1/series/${seriesId}`)
    ),
  ]);

  const squadsRaw =
    squadsResult.status === "fulfilled" ? squadsResult.value : null;
  const squads = squadsRaw ? parseSeriesSquads(squadsRaw) : [];
  if (squadsRaw && (squadsRaw as { seriesName?: string }).seriesName) {
    seriesName = (squadsRaw as { seriesName?: string }).seriesName ?? seriesName;
  }

  const newsRaw = newsResult.status === "fulfilled" ? newsResult.value : null;
  const news = newsRaw ? parseNewsIndex(newsRaw).slice(0, 8) : [];

  return {
    id: seriesId,
    name: seriesName,
    matchGroups,
    squads,
    pointsTable:
      pointsResult.status === "fulfilled" ? pointsResult.value : [],
    news,
  };
}

export async function getSquadPlayers(seriesId: number, squadId: number) {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.seriesSquadPlayers(
    seriesId,
    squadId
  );
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>(`/series/v1/${seriesId}/squads/${squadId}`)
  );
  if (!raw) return [];
  return parseTeamPlayers(raw);
}

export async function getPlayerNews(
  playerId: number,
  limit = 6
): Promise<CricketNewsItem[]> {
  if (!isSportsApiConfigured()) return [];
  const { key, ttl, staleTtl } = SPORTS_CACHE.playerNews(playerId);
  const raw = await readSportsPayload(key, ttl, staleTtl, () =>
    cricbuzzFetch<unknown>(`/news/v1/player/${playerId}`)
  );
  if (!raw) return [];
  return parseNewsIndex(raw).slice(0, limit);
}

export function sportsApiErrorMessage(err: unknown): string {
  if (err instanceof SportsApiError) {
    if (err.status === 429) return "Rate limit reached. Showing cached data.";
    if (err.status === 503) {
      return "Sports data is syncing. Please try again shortly.";
    }
    return err.message;
  }
  return "Unable to load sports data.";
}
