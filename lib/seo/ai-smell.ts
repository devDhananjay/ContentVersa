/** Phrases that make AdSense reviewers smell mass AI filler. */

export const AI_SMELL_PATTERNS: RegExp[] = [
  /in today'?s (digital|fast-paced|ever-evolving|competitive)/i,
  /delve into/i,
  /it'?s (important|crucial|essential) to (note|understand|remember)/i,
  /\bfurthermore\b/i,
  /\bmoreover\b/i,
  /in conclusion,/i,
  /landscape of/i,
  /when it comes to/i,
  /in the realm of/i,
  /a (comprehensive|ultimate) guide/i,
  /unlock(ing)? the (power|potential)/i,
  /game-?changer/i,
  /cutting-?edge/i,
  /\bleverage\b/i,
  /\brobust\b/i,
  /seamless(ly)?/i,
  /dive deep/i,
  /at the end of the day/i,
  /not only .+ but also/i,
  /in this article,? we (will|are going to)/i,
  /let'?s explore/i,
  /navigating the/i,
  /tapestry of/i,
  /multifaceted/i,
  /in the digital age/i,
  /as we (move|navigate) forward/i,
  /it goes without saying/i,
  /a plethora of/i,
  /shed light on/i,
  /play a (crucial|pivotal|vital) role/i,
];

export function countAiSmellMarkers(text: string): number {
  let n = 0;
  for (const re of AI_SMELL_PATTERNS) {
    if (re.test(text)) n++;
  }
  return n;
}

export function listAiSmellHits(text: string): string[] {
  const hits: string[] = [];
  for (const re of AI_SMELL_PATTERNS) {
    const m = text.match(re);
    if (m?.[0]) hits.push(m[0]);
  }
  return hits;
}
