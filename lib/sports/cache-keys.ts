export const SPORTS_CACHE = {
  live: { key: "sports:matches:live", ttl: 30, staleTtl: 3600 },
  upcoming: { key: "sports:matches:upcoming", ttl: 300, staleTtl: 3600 },
  recent: { key: "sports:matches:recent", ttl: 300, staleTtl: 3600 },
  news: { key: "sports:news:index", ttl: 600, staleTtl: 3600 },
  newsDetail: (id: number) => ({
    key: `sports:news:${id}`,
    ttl: 600,
    staleTtl: 3600,
  }),
  matchDetail: (id: number) => ({
    key: `sports:match:${id}`,
    ttl: 30,
    staleTtl: 3600,
  }),
  series: { key: "sports:series:international", ttl: 3600, staleTtl: 86400 },
  schedule: { key: "sports:schedule:international", ttl: 1800, staleTtl: 86400 },
  rankings: (format: string) => ({
    key: `sports:rankings:batsmen:${format}`,
    ttl: 3600,
    staleTtl: 86400,
  }),
  trendingPlayers: { key: "sports:players:trending", ttl: 1800, staleTtl: 86400 },
  pointsTable: (seriesId: number) => ({
    key: `sports:points-table:${seriesId}`,
    ttl: 1800,
    staleTtl: 86400,
  }),
  matchCommentary: (id: number) => ({
    key: `sports:match:${id}:comm`,
    ttl: 30,
    staleTtl: 3600,
  }),
  matchScorecard: (id: number) => ({
    key: `sports:match:${id}:scard`,
    ttl: 30,
    staleTtl: 3600,
  }),
  teams: { key: "sports:teams:international", ttl: 3600, staleTtl: 86400 },
  teamPlayers: (id: number) => ({
    key: `sports:team:${id}:players`,
    ttl: 3600,
    staleTtl: 86400,
  }),
  teamSchedule: (id: number) => ({
    key: `sports:team:${id}:schedule`,
    ttl: 1800,
    staleTtl: 86400,
  }),
  teamResults: (id: number) => ({
    key: `sports:team:${id}:results`,
    ttl: 1800,
    staleTtl: 86400,
  }),
  playerSearch: (q: string) => ({
    key: `sports:player:search:${q.toLowerCase()}`,
    ttl: 3600,
    staleTtl: 86400,
  }),
  playerProfile: (id: number) => ({
    key: `sports:player:${id}:profile`,
    ttl: 3600,
    staleTtl: 86400,
  }),
  playerBatting: (id: number) => ({
    key: `sports:player:${id}:batting`,
    ttl: 3600,
    staleTtl: 86400,
  }),
  playerBowling: (id: number) => ({
    key: `sports:player:${id}:bowling`,
    ttl: 3600,
    staleTtl: 86400,
  }),
  seriesDetail: (id: number) => ({
    key: `sports:series:${id}:detail`,
    ttl: 1800,
    staleTtl: 86400,
  }),
  seriesSquads: (id: number) => ({
    key: `sports:series:${id}:squads`,
    ttl: 3600,
    staleTtl: 86400,
  }),
  seriesSquadPlayers: (seriesId: number, squadId: number) => ({
    key: `sports:series:${seriesId}:squad:${squadId}`,
    ttl: 3600,
    staleTtl: 86400,
  }),
  seriesNews: (id: number) => ({
    key: `sports:series:${id}:news`,
    ttl: 600,
    staleTtl: 3600,
  }),
  playerNews: (id: number) => ({
    key: `sports:player:${id}:news`,
    ttl: 600,
    staleTtl: 3600,
  }),
  playerIndex: {
    key: "sports:players:index",
    ttl: 3600,
    staleTtl: 86400,
  },
} as const;
