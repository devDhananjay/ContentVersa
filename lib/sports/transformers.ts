import type {
  CommentaryItem,
  CricketNewsDetail,
  CricketNewsItem,
  CricketSeries,
  MatchScorecard,
  PlayerRanking,
  PointsTableRow,
  RankingFormat,
  ScheduleDay,
  ScheduleMatch,
  ScorecardInnings,
  MatchGroup,
  PlayerProfile,
  PlayerSearchResult,
  PlayerStatsTable,
  SeriesDetailData,
  SeriesSquadSummary,
  SportMatch,
  SportsHubData,
  SportsTeaserData,
  SportTeam,
  TeamInningsScore,
  TeamPlayer,
  TeamSummary,
  TrendingPlayer,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function cricbuzzImageUrl(
  imageId?: number | string,
  size = "360x202"
): string | undefined {
  if (!imageId) return undefined;
  return `https://www.cricbuzz.com/a/img/v1/${size}/i1/c${imageId}/i.jpg`;
}

function parseTeam(raw: any): SportTeam {
  return {
    id: raw?.teamId ?? 0,
    name: raw?.teamName ?? "TBD",
    shortName: raw?.teamSName ?? "TBD",
    imageId: raw?.imageId,
  };
}

function parseInnings(raw: any): TeamInningsScore[] {
  if (!raw) return [];
  const innings: TeamInningsScore[] = [];
  for (const key of Object.keys(raw)) {
    const inn = raw[key];
    if (!inn || typeof inn.runs !== "number") continue;
    innings.push({
      runs: inn.runs,
      wickets: inn.wickets ?? 0,
      overs: inn.overs ?? 0,
    });
  }
  return innings;
}

function formatScoreLine(scores: TeamInningsScore[]): string {
  if (!scores.length) return "—";
  return scores
    .map((s) => `${s.runs}/${s.wickets} (${s.overs})`)
    .join(" & ");
}

export function getMatchScoreSummary(match: SportMatch): {
  team1: string;
  team2: string;
} {
  return {
    team1: formatScoreLine(match.team1Scores),
    team2: formatScoreLine(match.team2Scores),
  };
}

export function parseMatchesResponse(raw: any): SportMatch[] {
  const matches: SportMatch[] = [];
  const typeMatches = raw?.typeMatches ?? [];

  for (const typeBlock of typeMatches) {
    const matchType = typeBlock?.matchType ?? "Other";
    for (const seriesBlock of typeBlock?.seriesMatches ?? []) {
      const wrapper = seriesBlock?.seriesAdWrapper;
      if (!wrapper) continue;

      for (const item of wrapper.matches ?? []) {
        const info = item?.matchInfo;
        if (!info?.matchId) continue;

        const state = info.state ?? info.stateTitle ?? "";
        const isLive =
          state === "In Progress" ||
          state === "Live" ||
          String(info.stateTitle ?? "").toLowerCase().includes("progress");

        matches.push({
          id: info.matchId,
          seriesId: info.seriesId ?? wrapper.seriesId ?? 0,
          seriesName: info.seriesName ?? wrapper.seriesName ?? "",
          matchDesc: info.matchDesc ?? "",
          format: info.matchFormat ?? "",
          matchType,
          state,
          status: info.status ?? "",
          stateTitle: info.stateTitle ?? state,
          startDate: info.startDate
            ? new Date(Number(info.startDate)).toISOString()
            : new Date().toISOString(),
          team1: parseTeam(info.team1),
          team2: parseTeam(info.team2),
          venue: info.venueInfo
            ? {
                ground: info.venueInfo.ground ?? "",
                city: info.venueInfo.city ?? "",
              }
            : undefined,
          team1Scores: parseInnings(item?.matchScore?.team1Score),
          team2Scores: parseInnings(item?.matchScore?.team2Score),
          isLive,
        });
      }
    }
  }

  return matches;
}

export function parseNewsIndex(raw: any): CricketNewsItem[] {
  const items: CricketNewsItem[] = [];

  for (const entry of raw?.storyList ?? []) {
    const story = entry?.story;
    if (!story?.id) continue;

    items.push({
      id: story.id,
      headline: story.hline ?? story.seoHeadline ?? "Untitled",
      intro: story.intro ?? "",
      context: story.context,
      storyType: story.storyType,
      source: story.source,
      publishedAt: story.pubTime
        ? new Date(Number(story.pubTime)).toISOString()
        : new Date().toISOString(),
      imageId: story.imageId ?? story.coverImage?.id,
      imageUrl: cricbuzzImageUrl(story.imageId ?? story.coverImage?.id),
    });
  }

  return items;
}

export function parseNewsDetail(raw: any): CricketNewsDetail | null {
  if (!raw?.id) return null;

  const paragraphs: string[] = [];
  for (const block of raw.content ?? []) {
    const value = block?.content?.contentValue;
    if (typeof value === "string" && value.trim()) {
      paragraphs.push(value.trim());
    }
  }

  const imageId = raw.coverImage?.id ?? raw.imageId;

  return {
    id: raw.id,
    headline: raw.headline ?? raw.hline ?? "Untitled",
    intro: paragraphs[0] ?? "",
    context: raw.context,
    storyType: raw.storyType,
    source: raw.source ?? raw.coverImage?.source,
    publishedAt: raw.publishTime
      ? new Date(Number(raw.publishTime)).toISOString()
      : new Date().toISOString(),
    imageId,
    imageUrl: cricbuzzImageUrl(imageId, "640x360"),
    content: paragraphs,
  };
}

export function playerFaceImageUrl(faceImageId?: number): string | undefined {
  return cricbuzzImageUrl(faceImageId, "64x64");
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
}

function parseMatchFromInfo(item: any): SportMatch | null {
  const info = item?.matchInfo ?? item;
  if (!info?.matchId) return null;

  const state = info.state ?? info.stateTitle ?? "";
  const isLive =
    state === "In Progress" ||
    state === "Live" ||
    String(info.stateTitle ?? "").toLowerCase().includes("progress");

  return {
    id: info.matchId,
    seriesId: info.seriesId ?? 0,
    seriesName: info.seriesName ?? "",
    matchDesc: info.matchDesc ?? "",
    format: info.matchFormat ?? "",
    matchType: info.matchType ?? "International",
    state,
    status: info.status ?? "",
    stateTitle: info.stateTitle ?? state,
    startDate: info.startDate
      ? new Date(Number(info.startDate)).toISOString()
      : new Date().toISOString(),
    team1: parseTeam(info.team1),
    team2: parseTeam(info.team2),
    venue: info.venueInfo
      ? {
          ground: info.venueInfo.ground ?? "",
          city: info.venueInfo.city ?? "",
        }
      : undefined,
    team1Scores: parseInnings(item?.matchScore?.team1Score),
    team2Scores: parseInnings(item?.matchScore?.team2Score),
    isLive,
  };
}

export function parseMatchDetail(raw: any): SportMatch | null {
  return parseMatchFromInfo(raw);
}

export function scheduleMatchToSportMatch(match: ScheduleMatch): SportMatch {
  return {
    id: match.id,
    seriesId: match.seriesId,
    seriesName: match.seriesName,
    matchDesc: match.matchDesc,
    format: match.format,
    matchType: "International",
    state: "Upcoming",
    status: match.matchDesc,
    stateTitle: "Scheduled",
    startDate: match.startDate,
    team1: match.team1,
    team2: match.team2,
    venue: match.venue,
    team1Scores: [],
    team2Scores: [],
    isLive: false,
  };
}

export function parseGroupedMatches(
  raw: any,
  blocksKey: "matchDetails" | "teamMatchesData"
): MatchGroup[] {
  const groups: MatchGroup[] = [];

  for (const block of raw?.[blocksKey] ?? []) {
    const map = block?.matchDetailsMap;
    if (!map) continue;

    const matches: SportMatch[] = [];
    for (const item of map.match ?? []) {
      const m = parseMatchFromInfo(item);
      if (m) matches.push(m);
    }

    if (matches.length) {
      groups.push({ dateLabel: map.key ?? "", matches });
    }
  }

  return groups;
}

export function parseTeamsList(raw: any): TeamSummary[] {
  return (raw?.list ?? [])
    .filter((t: any) => t.teamId)
    .map((t: any) => ({
      id: t.teamId,
      name: t.teamName ?? "",
      shortName: t.teamSName ?? t.teamName ?? "",
      imageId: t.imageId,
      countryName: t.countryName,
    }));
}

export function parseTeamPlayers(raw: any): TeamPlayer[] {
  return (raw?.player ?? [])
    .filter((p: any) => p.id && !p.isHeader)
    .map((p: any) => ({
      id: Number(p.id),
      name: p.name ?? "",
      role: p.role,
      battingStyle: p.battingStyle,
      bowlingStyle: p.bowlingStyle,
      imageId: p.imageId ? Number(p.imageId) : undefined,
      captain: p.captain,
    }));
}

export function parsePlayerSearch(raw: any): PlayerSearchResult[] {
  return (raw?.player ?? []).slice(0, 20).map((p: any) => ({
    id: Number(p.id),
    name: p.name ?? "",
    teamName: p.teamName ?? "",
    faceImageId: p.faceImageId ? Number(p.faceImageId) : undefined,
    dob: p.dob !== "N/A" ? p.dob : undefined,
  }));
}

export function parsePlayerProfile(raw: any): PlayerProfile | null {
  if (!raw?.id && !raw?.name) return null;
  const id = Number(raw.id);
  return {
    id,
    name: raw.name ?? "",
    fullName: raw.fullName,
    role: raw.role,
    birthPlace: raw.birthPlace,
    dob: raw.DoB ?? raw.dob,
    intlTeam: raw.intlTeam,
    teams: raw.teams,
    battingStyle: raw.bat,
    bowlingStyle: raw.bowl,
    imageUrl: raw.image ?? playerFaceImageUrl(id),
    bio: raw.bio ? stripHtml(raw.bio) : undefined,
  };
}

export function parsePlayerStats(raw: any): PlayerStatsTable {
  return {
    headers: raw?.headers ?? [],
    rows: (raw?.values ?? []).map((row: any) => ({
      label: row.values?.[0] ?? "",
      values: (row.values ?? []).slice(1).map(String),
    })),
  };
}

export function parseSeriesSquads(raw: any): SeriesSquadSummary[] {
  return (raw?.squads ?? [])
    .filter((s: any) => s.squadId && !s.isHeader)
    .map((s: any) => ({
      squadId: s.squadId,
      label: s.squadType ?? "",
      teamId: s.teamId ?? 0,
      imageId: s.imageId,
    }));
}

export function parseSeriesDetailMeta(raw: any) {
  const first = raw?.matchDetails?.[0]?.matchDetailsMap;
  const name =
    first?.match?.[0]?.matchInfo?.seriesName ??
    raw?.seriesName ??
    "Series";
  const id = first?.seriesId ?? raw?.seriesId ?? 0;
  return { id: Number(id), name: String(name) };
}

export function parseSeriesList(raw: any): CricketSeries[] {
  const series: CricketSeries[] = [];
  const now = Date.now();

  for (const block of raw?.seriesMapProto ?? []) {
    const monthLabel = block?.date ?? "";
    for (const s of block?.series ?? []) {
      if (!s?.id) continue;
      const end = Number(s.endDt ?? 0);
      if (end && end < now - 7 * 86400000) continue;
      series.push({
        id: s.id,
        name: s.name ?? "",
        startDate: s.startDt
          ? new Date(Number(s.startDt)).toISOString()
          : new Date().toISOString(),
        endDate: s.endDt
          ? new Date(Number(s.endDt)).toISOString()
          : new Date().toISOString(),
        monthLabel,
      });
    }
  }

  return series.slice(0, 20);
}

export function parseSchedule(raw: any): ScheduleDay[] {
  const days: ScheduleDay[] = [];

  for (const block of raw?.matchScheduleMap ?? []) {
    const wrapper = block?.scheduleAdWrapper;
    if (!wrapper) continue;

    const matches: ScheduleMatch[] = [];
    for (const series of wrapper.matchScheduleList ?? []) {
      const seriesName = series?.seriesName ?? "";
      const seriesId = series?.seriesId ?? 0;
      for (const info of series?.matchInfo ?? []) {
        if (!info?.matchId) continue;
        matches.push({
          id: info.matchId,
          seriesId: info.seriesId ?? seriesId,
          seriesName: info.seriesName ?? seriesName,
          matchDesc: info.matchDesc ?? "",
          format: info.matchFormat ?? "",
          startDate: info.startDate
            ? new Date(Number(info.startDate)).toISOString()
            : new Date().toISOString(),
          team1: parseTeam(info.team1),
          team2: parseTeam(info.team2),
          venue: info.venueInfo
            ? {
                ground: info.venueInfo.ground ?? "",
                city: info.venueInfo.city ?? "",
              }
            : undefined,
        });
      }
    }

    if (matches.length) {
      days.push({ dateLabel: wrapper.date ?? "", matches });
    }
  }

  return days.slice(0, 7);
}

export function parseRankings(raw: any): PlayerRanking[] {
  return (raw?.rank ?? []).slice(0, 10).map((r: any) => ({
    id: Number(r.id),
    rank: Number(r.rank),
    name: r.name ?? "",
    country: r.country ?? "",
    rating: Number(r.rating ?? r.points ?? 0),
    trend: r.trend,
    faceImageId: r.faceImageId ? Number(r.faceImageId) : undefined,
  }));
}

export function parseTrendingPlayers(raw: any): TrendingPlayer[] {
  return (raw?.player ?? []).slice(0, 8).map((p: any) => ({
    id: Number(p.id),
    name: p.name ?? "",
    teamName: p.teamName ?? "",
    faceImageId: p.faceImageId ? Number(p.faceImageId) : undefined,
  }));
}

export function parsePointsTable(raw: any): PointsTableRow[] {
  const rows: PointsTableRow[] = [];
  for (const group of raw?.pointsTable ?? []) {
    for (const row of group?.pointsTableInfo ?? []) {
      rows.push({
        teamId: row.teamId ?? 0,
        teamName: row.teamName ?? row.teamFullName ?? "",
        teamFullName: row.teamFullName ?? row.teamName ?? "",
        played: row.matchesPlayed ?? 0,
        won: row.matchesWon ?? 0,
        lost: row.matchesLost ?? 0,
        points: row.points ?? 0,
        nrr: row.nrr ?? "0",
      });
    }
  }
  return rows.slice(0, 10);
}

export function parseCommentary(raw: any): CommentaryItem[] {
  const items: CommentaryItem[] = [];
  for (const block of raw?.comwrapper ?? []) {
    const c = block?.commentary;
    if (!c?.commtxt) continue;
    items.push({
      text: c.commtxt,
      overNum: String(c.overnum ?? ""),
      eventType: c.eventtype !== "NONE" ? c.eventtype : undefined,
      timestamp: c.timestamp
        ? new Date(Number(c.timestamp)).toISOString()
        : new Date().toISOString(),
    });
  }
  return items;
}

export function parseScorecard(raw: any): MatchScorecard {
  const innings: ScorecardInnings[] = [];

  for (const inn of raw?.scorecard ?? []) {
    const extras = inn.extras;
    const extrasStr = extras
      ? `b ${extras.b ?? 0}, lb ${extras.lb ?? 0}, w ${extras.w ?? 0}, nb ${extras.nb ?? 0}, p ${extras.p ?? 0}`
      : undefined;

    innings.push({
      id: inn.inningsid ?? 0,
      teamName: inn.batteamname ?? "",
      teamShortName: inn.batteamsname ?? "",
      score: inn.score ?? "",
      overs: String(inn.overs ?? ""),
      runRate: inn.runrate ? Number(inn.runrate) : undefined,
      extras: extrasStr,
      batsmen: (inn.batsman ?? []).map((b: any) => ({
        name: b.name ?? b.nickname ?? "",
        runs: b.runs ?? 0,
        balls: b.balls ?? 0,
        fours: b.fours ?? 0,
        sixes: b.sixes ?? 0,
        strikeRate: Number(b.strkrate ?? 0),
        dismissal: b.outdec || undefined,
        isCaptain: b.iscaptain,
        isKeeper: b.iskeeper,
      })),
      bowlers: (inn.bowler ?? []).map((b: any) => ({
        name: b.name ?? b.nickname ?? "",
        overs: String(b.overs ?? "0"),
        maidens: b.maidens ?? 0,
        runs: b.runs ?? 0,
        wickets: b.wickets ?? 0,
        economy: Number(b.economy ?? 0),
      })),
    });
  }

  return {
    innings,
    status: raw?.status,
    isComplete: Boolean(raw?.ismatchcomplete),
  };
}
