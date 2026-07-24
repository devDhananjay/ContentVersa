/** Parse a YouTube watch/share URL into a video id. */
export function parseYoutubeVideoId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return id && id.length >= 6 ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = url.searchParams.get("v");
      if (v) return v;

      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" && parts[1]) return parts[1];
      if (parts[0] === "shorts" && parts[1]) return parts[1];
      if (parts[0] === "live" && parts[1]) return parts[1];
    }
  } catch {
    return null;
  }

  return null;
}

/** Canonical embed URL for iframe src (works in preview + published posts). */
export function toYoutubeEmbedUrl(input: string): string | null {
  const id = parseYoutubeVideoId(input);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}

const IFRAME_RE =
  /<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*(?:\/>|><\/iframe>)/gi;

/** Extract YouTube iframe blocks and ```poll fences from markdown for custom rendering. */
export function splitMarkdownEmbeds(content: string) {
  type Part =
    | { type: "markdown"; value: string }
    | { type: "youtube"; src: string }
    | { type: "poll"; body: string };

  const parts: Part[] = [];
  const POLL_RE = /```poll\s*\n([\s\S]*?)```/gi;

  let last = 0;
  let match: RegExpExecArray | null;
  POLL_RE.lastIndex = 0;
  const pollHits: { index: number; length: number; body: string }[] = [];
  while ((match = POLL_RE.exec(content)) !== null) {
    pollHits.push({
      index: match.index,
      length: match[0].length,
      body: match[1].trim(),
    });
  }

  const segments: Part[] = [];
  let cursor = 0;
  for (const hit of pollHits) {
    if (hit.index > cursor) {
      segments.push({ type: "markdown", value: content.slice(cursor, hit.index) });
    }
    segments.push({ type: "poll", body: hit.body });
    cursor = hit.index + hit.length;
  }
  if (cursor < content.length) {
    segments.push({ type: "markdown", value: content.slice(cursor) });
  }
  if (!segments.length) {
    segments.push({ type: "markdown", value: content });
  }

  for (const seg of segments) {
    if (seg.type !== "markdown") {
      parts.push(seg);
      continue;
    }
    last = 0;
    IFRAME_RE.lastIndex = 0;
    while ((match = IFRAME_RE.exec(seg.value)) !== null) {
      if (match.index > last) {
        parts.push({ type: "markdown", value: seg.value.slice(last, match.index) });
      }
      parts.push({ type: "youtube", src: match[1] });
      last = match.index + match[0].length;
    }
    if (last < seg.value.length) {
      parts.push({ type: "markdown", value: seg.value.slice(last) });
    }
  }

  if (parts.length === 0) {
    parts.push({ type: "markdown", value: content });
  }

  return parts;
}
