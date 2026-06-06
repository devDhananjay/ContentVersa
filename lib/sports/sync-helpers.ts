import { SPORTS_CACHE } from "./cache-keys";
import { getSportsDbCache, setSportsDbCache } from "./db-cache";
import {
  parseTeamPlayers,
  parseTeamsList,
  parseTrendingPlayers,
} from "./transformers";
import type { PlayerSearchResult } from "./types";

export async function rebuildPlayerIndexFromCache(): Promise<void> {
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
