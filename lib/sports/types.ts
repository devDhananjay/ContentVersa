export type MatchState =
  | "Live"
  | "Upcoming"
  | "Complete"
  | "Preview"
  | "In Progress"
  | string;

export type RankingFormat = "test" | "odi" | "t20";

export interface SportTeam {
  id: number;
  name: string;
  shortName: string;
  imageId?: number;
}

export interface SportVenue {
  ground: string;
  city: string;
}

export interface TeamInningsScore {
  runs: number;
  wickets: number;
  overs: number;
}

export interface SportMatch {
  id: number;
  seriesId: number;
  seriesName: string;
  matchDesc: string;
  format: string;
  matchType: string;
  state: MatchState;
  status: string;
  stateTitle: string;
  startDate: string;
  team1: SportTeam;
  team2: SportTeam;
  venue?: SportVenue;
  team1Scores: TeamInningsScore[];
  team2Scores: TeamInningsScore[];
  isLive: boolean;
}

export interface CricketNewsItem {
  id: number;
  headline: string;
  intro: string;
  context?: string;
  storyType?: string;
  source?: string;
  publishedAt: string;
  imageId?: number;
  imageUrl?: string;
}

export interface CricketNewsDetail extends CricketNewsItem {
  content: string[];
}

export interface CricketSeries {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  monthLabel?: string;
}

export interface ScheduleMatch {
  id: number;
  seriesId: number;
  seriesName: string;
  matchDesc: string;
  format: string;
  startDate: string;
  team1: SportTeam;
  team2: SportTeam;
  venue?: SportVenue;
}

export interface ScheduleDay {
  dateLabel: string;
  matches: ScheduleMatch[];
}

export interface PlayerRanking {
  id: number;
  rank: number;
  name: string;
  country: string;
  rating: number;
  trend?: string;
  faceImageId?: number;
}

export interface TrendingPlayer {
  id: number;
  name: string;
  teamName: string;
  faceImageId?: number;
}

export interface PointsTableRow {
  teamId: number;
  teamName: string;
  teamFullName: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  nrr: string;
}

export interface CommentaryItem {
  text: string;
  overNum: string;
  eventType?: string;
  timestamp: string;
}

export interface ScorecardBatsman {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dismissal?: string;
  isCaptain?: boolean;
  isKeeper?: boolean;
}

export interface ScorecardBowler {
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface ScorecardInnings {
  id: number;
  teamName: string;
  teamShortName: string;
  score: string;
  overs: string;
  runRate?: number;
  extras?: string;
  batsmen: ScorecardBatsman[];
  bowlers: ScorecardBowler[];
}

export interface MatchScorecard {
  innings: ScorecardInnings[];
  status?: string;
  isComplete: boolean;
}

export interface SportsHubData {
  live: SportMatch[];
  upcoming: SportMatch[];
  recent: SportMatch[];
  news: CricketNewsItem[];
  series: CricketSeries[];
  schedule: ScheduleDay[];
  rankings: PlayerRanking[];
  rankingsByFormat: Partial<Record<RankingFormat, PlayerRanking[]>>;
  trendingPlayers: TrendingPlayer[];
  pointsTable: PointsTableRow[];
  pointsTableSeriesName?: string;
  configured: boolean;
}

export interface SportsTeaserData {
  live: SportMatch[];
  upcoming: SportMatch[];
  news: CricketNewsItem[];
  configured: boolean;
}

export interface TeamSummary extends SportTeam {
  countryName?: string;
}

export interface TeamPlayer {
  id: number;
  name: string;
  role?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  imageId?: number;
  captain?: boolean;
}

export interface PlayerSearchResult {
  id: number;
  name: string;
  teamName: string;
  faceImageId?: number;
  dob?: string;
}

export interface PlayerProfile {
  id: number;
  name: string;
  fullName?: string;
  role?: string;
  birthPlace?: string;
  dob?: string;
  intlTeam?: string;
  teams?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  imageUrl?: string;
  bio?: string;
}

export interface PlayerStatsTable {
  headers: string[];
  rows: { label: string; values: string[] }[];
}

export interface MatchGroup {
  dateLabel: string;
  matches: SportMatch[];
}

export interface SeriesSquadSummary {
  squadId: number;
  label: string;
  teamId: number;
  imageId?: number;
}

export interface SeriesDetailData {
  id: number;
  name: string;
  matchGroups: MatchGroup[];
  squads: SeriesSquadSummary[];
  pointsTable: PointsTableRow[];
  news: CricketNewsItem[];
}
