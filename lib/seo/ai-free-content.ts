/**
 * Mandatory AI-free cleanup gate before any blog goes PUBLISHED.
 * Scrubs ChatGPT-style filler (Grammarly-style pass) and blocks publish if smell remains.
 */
import { countAiSmellMarkers, listAiSmellHits } from "@/lib/seo/ai-smell";

export class AiFreePublishError extends Error {
  readonly code = "AI_FREE_REQUIRED" as const;
  constructor(
    message: string,
    readonly hits: string[]
  ) {
    super(message);
    this.name = "AiFreePublishError";
  }
}

/** Order matters — longer / more specific first. */
export const AI_FREE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/In today's (?:digital|fast-paced|ever-evolving|competitive) (?:world|age|landscape|environment),?\s*/gi, ""],
  [/in today's (?:digital|fast-paced|ever-evolving|competitive) (?:world|age|landscape|environment),?\s*/gi, ""],
  [/In today's competitive\s+/gi, "In a tough "],
  [/in today's competitive\s+/gi, "in a tough "],
  [/not only ([^,.\n]{3,120}) but also/gi, "both $1 and"],
  [/delve into/gi, "look at"],
  [/\bdelve\b/gi, "look"],
  [/dive deep into/gi, "look closely at"],
  [/dive deep/gi, "go deeper"],
  [/it's (?:important|crucial|essential) to (?:note|understand|remember) that\s*/gi, ""],
  [/It'?s (?:important|crucial|essential) to (?:note|understand|remember) that\s*/gi, ""],
  [/\bFurthermore,\s*/gi, "Also, "],
  [/\bMoreover,\s*/gi, "Also, "],
  [/In conclusion,\s*/gi, "Bottom line: "],
  [/the landscape of/gi, "the state of"],
  [/landscape of/gi, "state of"],
  [/When it comes to/gi, "For"],
  [/when it comes to/gi, "for"],
  [/in the realm of/gi, "in"],
  [/a comprehensive guide/gi, "a practical guide"],
  [/an ultimate guide/gi, "a practical guide"],
  [/unlock(?:ing)? the (?:power|potential) of/gi, "get more from"],
  [/game-?changer/gi, "big shift"],
  [/cutting-?edge/gi, "modern"],
  [/\bleverage\b/gi, "use"],
  [/\brobust\b/gi, "solid"],
  [/seamless(?:ly)?/gi, "smooth"],
  [/at the end of the day,?\s*/gi, ""],
  [/In this article,?\s*we (?:will|are going to)\s*/gi, "Here I'll "],
  [/in this article,?\s*we (?:will|are going to)\s*/gi, "here I'll "],
  [/Let'?s explore/gi, "Here's"],
  [/let'?s explore/gi, "here's"],
  [/Navigating the/gi, "Working through"],
  [/navigating the/gi, "working through"],
  [/tapestry of/gi, "mix of"],
  [/multifaceted/gi, "layered"],
  [/in the digital age/gi, "online today"],
  [/As we (?:move|navigate) forward,?\s*/gi, ""],
  [/It goes without saying that\s*/gi, ""],
  [/a plethora of/gi, "plenty of"],
  [/shed light on/gi, "explain"],
  [/play(?:s)? a (?:crucial|pivotal|vital) role/gi, "matters a lot"],
  [/Nestled on the banks of/gi, "On the banks of"],
  [/nestled on the banks of/gi, "on the banks of"],
  [/\bin the banks of\b/gi, "on the banks of"],
  [/Nestled (?:in|within|among)/gi, "In"],
  [/nestled (?:in|within|on|among)/gi, "in"],
  [/\bnestled\b/gi, "set"],
  [/\btapestry\b/gi, "mix"],
  [/firmly established/gi, "well known"],
  [/In this article,?\s*/gi, ""],
  [/in this article,?\s*/gi, ""],
  [/a testament to/gi, "proof of"],
  [/testament to/gi, "proof of"],
  [/industrial landscape/gi, "industry scene"],
  [/monumental shift/gi, "big shift"],
  [/fundamentally changing how/gi, "changing how"],
  [/In an era where/gi, "Now that"],
  [/in an era where/gi, "now that"],
  [/[Ii]t is worth noting that\s*/g, ""],
  [/To summarize,\s*/gi, "Quick take: "],
  [/[Ww]ithout further ado,?\s*/g, ""],
  [/embark on/gi, "start"],
  [/myriad of/gi, "many"],
  [/holistic approach/gi, "full approach"],
  [/paradigm shift/gi, "big change"],
  [/has firmly established itself as/gi, "is now"],
  [/firmly established itself as/gi, "is now"],
  [/exploded onto the/gi, "moved into the"],
  [/living,? breathing/gi, "real, everyday"],
  [/bustling (metropolis|city|market)/gi, "busy $1"],
  [/rich (?:cultural )?tapestry/gi, "mix of culture"],
  [/stands as a (?:beacon|testament)/gi, "shows"],
  [/## Introduction:[^\n]*/gi, "## Why this matters"],
  [/## Conclusion\b/gi, "## Takeaway"],
];

export function scrubAiFreeText(input: string): string {
  let out = input;
  for (const [re, to] of AI_FREE_REPLACEMENTS) {
    out = out.replace(re, to);
  }
  return out
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^ +/gm, "")
    .trim();
}

export type AiFreePublishFields = {
  title: string;
  excerpt: string | null;
  content: string;
  metaDescription: string | null;
  markersBefore: number;
  markersAfter: number;
  changed: boolean;
};

/**
 * Scrub AI tells, then hard-fail if any smell markers remain.
 * Call this immediately before setting status=PUBLISHED — no exceptions.
 */
export function prepareAiFreePublishFields(input: {
  title: string;
  excerpt?: string | null;
  content: string;
  metaDescription?: string | null;
}): AiFreePublishFields {
  const markersBefore = countAiSmellMarkers(
    `${input.title}\n${input.excerpt || ""}\n${input.content}`
  );

  const title = scrubAiFreeText(input.title);
  const excerpt = input.excerpt != null ? scrubAiFreeText(input.excerpt) : null;
  const content = scrubAiFreeText(input.content);
  const metaDescription =
    input.metaDescription != null ? scrubAiFreeText(input.metaDescription) : null;

  const markersAfter = countAiSmellMarkers(
    `${title}\n${excerpt || ""}\n${content}`
  );
  const hits = listAiSmellHits(`${title}\n${excerpt || ""}\n${content}`);

  if (markersAfter > 0 || hits.length > 0) {
    throw new AiFreePublishError(
      `AI-free gate failed — still AI-sounding after cleanup (${hits.slice(0, 5).join(", ")}). Edit manually, then publish.`,
      hits
    );
  }

  return {
    title,
    excerpt,
    content,
    metaDescription,
    markersBefore,
    markersAfter: 0,
    changed:
      title !== input.title ||
      content !== input.content.trim() ||
      (excerpt || "") !== (input.excerpt || "") ||
      (metaDescription || "") !== (input.metaDescription || ""),
  };
}

export function isAiFreePublishError(err: unknown): err is AiFreePublishError {
  return err instanceof AiFreePublishError;
}
