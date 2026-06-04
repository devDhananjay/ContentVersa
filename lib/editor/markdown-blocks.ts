export type BlockType =
  | "paragraph"
  | "heading-1"
  | "heading-2"
  | "list"
  | "ordered-list"
  | "quote"
  | "code"
  | "image"
  | "embed"
  | "callout";

export interface EditorBlock {
  id: string;
  type: BlockType;
  content: string;
}

let blockIdCounter = 0;
export function nextBlockId() {
  return `blk-${++blockIdCounter}`;
}

export function resetBlockIdCounter() {
  blockIdCounter = 0;
}

export function defaultEditorBlocks(): EditorBlock[] {
  resetBlockIdCounter();
  return [
    { id: nextBlockId(), type: "heading-1", content: "" },
    { id: nextBlockId(), type: "paragraph", content: "" },
  ];
}

function parseSection(section: string): EditorBlock | EditorBlock[] | null {
  const s = section.trim();
  if (!s) return null;

  const imageMatch = /^!\[[^\]]*\]\(([^)]+)\)$/.exec(s);
  if (imageMatch) {
    return { id: nextBlockId(), type: "image", content: imageMatch[1] };
  }

  if (s.startsWith("<iframe")) {
    const srcMatch = /src=["']([^"']+)["']/.exec(s);
    return { id: nextBlockId(), type: "embed", content: srcMatch?.[1] || s };
  }

  if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(s)) {
    return { id: nextBlockId(), type: "embed", content: s };
  }

  if (s.startsWith("```")) {
    const lines = s.split("\n");
    const code = lines.slice(1, lines[lines.length - 1] === "```" ? -1 : undefined).join("\n");
    return { id: nextBlockId(), type: "code", content: code.replace(/\n```$/, "") };
  }

  if (s.startsWith("# ")) {
    return { id: nextBlockId(), type: "heading-1", content: s.slice(2).trim() };
  }
  if (s.startsWith("## ")) {
    return { id: nextBlockId(), type: "heading-2", content: s.slice(3).trim() };
  }

  const lines = s.split("\n");
  if (lines.every((l) => l.startsWith("> 💡 "))) {
    return {
      id: nextBlockId(),
      type: "callout",
      content: lines.map((l) => l.replace(/^> 💡 /, "")).join("\n"),
    };
  }
  if (lines.every((l) => l.startsWith("> "))) {
    return {
      id: nextBlockId(),
      type: "quote",
      content: lines.map((l) => l.replace(/^> /, "")).join("\n"),
    };
  }
  if (lines.every((l) => /^-\s/.test(l))) {
    return {
      id: nextBlockId(),
      type: "list",
      content: lines.map((l) => l.replace(/^-\s*/, "")).join("\n"),
    };
  }
  if (lines.every((l) => /^\d+\.\s/.test(l))) {
    return {
      id: nextBlockId(),
      type: "ordered-list",
      content: lines.map((l) => l.replace(/^\d+\.\s*/, "")).join("\n"),
    };
  }

  return { id: nextBlockId(), type: "paragraph", content: s };
}

/** Convert saved markdown back into block editor state. */
export function markdownToBlocks(md: string): EditorBlock[] {
  resetBlockIdCounter();
  const trimmed = md.trim();
  if (!trimmed) return defaultEditorBlocks();

  const sections: string[] = [];
  const lines = trimmed.split("\n");
  let buf: string[] = [];
  let inCode = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (!inCode) {
        if (buf.length) {
          sections.push(buf.join("\n"));
          buf = [];
        }
        inCode = true;
        buf.push(line);
        continue;
      }
      buf.push(line);
      sections.push(buf.join("\n"));
      buf = [];
      inCode = false;
      continue;
    }

    if (inCode) {
      buf.push(line);
      continue;
    }

    if (line.trim() === "" && buf.length) {
      sections.push(buf.join("\n"));
      buf = [];
      continue;
    }

    buf.push(line);
  }
  if (buf.length) sections.push(buf.join("\n"));

  const blocks: EditorBlock[] = [];
  for (const section of sections) {
    const parsed = parseSection(section);
    if (!parsed) continue;
    if (Array.isArray(parsed)) blocks.push(...parsed);
    else blocks.push(parsed);
  }

  return blocks.length ? blocks : defaultEditorBlocks();
}
