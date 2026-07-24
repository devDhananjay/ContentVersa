/** Parse / serialize inline poll fences: ```poll … ``` */

export type InlinePollDef = {
  question: string;
  options: string[];
};

export function parseInlinePollBody(body: string): InlinePollDef | null {
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 3) return null;
  const question = lines[0];
  const options = lines
    .slice(1)
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
  if (options.length < 2 || options.length > 6) return null;
  return { question, options };
}

/** Stable slug from question + options (no DB round-trip needed in markdown). */
export function inlinePollSlug(def: InlinePollDef): string {
  const key = `${def.question}\n${def.options.join("\n")}`.toLowerCase();
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `inline-${(h >>> 0).toString(36)}`;
}

export function serializeInlinePollBody(def: InlinePollDef): string {
  return [def.question, ...def.options].join("\n");
}

export function toPollFence(def: InlinePollDef): string {
  return "```poll\n" + serializeInlinePollBody(def) + "\n```";
}
