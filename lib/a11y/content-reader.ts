import {
  formatAccessibleAnnouncement,
  getAccessibleName,
  getHeadingLevel,
  getReadableTarget,
  normalizeText,
  shouldSkipElement,
} from "@/lib/a11y/accessible-name";
import {
  HEADING_TAGS,
  LANDMARK_ROLES,
  MAX_CHUNK_LENGTH,
  READABLE_TAGS,
} from "@/lib/a11y/constants";

export type ContentSegment = {
  element: Element;
  text: string;
};

export type PageStructureSummary = {
  announcement: string;
  title: string;
  counts: {
    headings: number;
    links: number;
    buttons: number;
    formFields: number;
    landmarks: number;
  };
  sectionHeadings: string[];
};

type ContentCache = {
  pathname: string;
  segments: ContentSegment[];
  builtAt: number;
};

let contentCache: ContentCache | null = null;
const CACHE_TTL_MS = 30_000;

function getMainRoot(): HTMLElement | null {
  return document.getElementById("main-content") ?? document.querySelector("main");
}

function isLandmark(element: Element): boolean {
  const role = element.getAttribute("role");
  if (role && LANDMARK_ROLES.has(role)) return true;
  return ["HEADER", "NAV", "MAIN", "FOOTER", "ASIDE", "FORM"].includes(element.tagName);
}

function isReadableBlock(element: Element): boolean {
  const tag = element.tagName;
  const role = element.getAttribute("role");

  if (READABLE_TAGS.has(tag)) return true;
  if (role && ["heading", "link", "button", "listitem", "img", "textbox"].includes(role)) {
    return true;
  }
  return false;
}

function isDescendantOfSpokenBlock(element: Element, spoken: Set<Element>): boolean {
  let parent = element.parentElement;
  while (parent) {
    if (spoken.has(parent)) {
      if (HEADING_TAGS.has(parent.tagName) && HEADING_TAGS.has(element.tagName)) {
        return false;
      }
      if (parent.tagName === "LI" && element.tagName === "LI") return false;
      if (parent.tagName === "TABLE" && element.closest("td, th") === element) return false;
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}

function announceTable(table: HTMLTableElement): string | null {
  const caption = normalizeText(table.querySelector("caption")?.textContent ?? "");
  const headers = Array.from(table.querySelectorAll("th"))
    .map((cell) => normalizeText(cell.textContent ?? ""))
    .filter(Boolean)
    .slice(0, 8);

  const rowCount = table.querySelectorAll("tr").length;
  const parts = ["Table"];
  if (caption) parts.push(caption);
  if (headers.length) parts.push(`Columns: ${headers.join(", ")}`);
  parts.push(`${rowCount} rows`);
  return parts.join(". ");
}

function announceListItem(item: HTMLLIElement, list: Element): string | null {
  const items = Array.from(list.querySelectorAll(":scope > li"));
  const index = items.indexOf(item);
  const name = getAccessibleName(item);
  if (!name) return null;
  return `List item ${index + 1} of ${items.length}. ${name}`;
}

function segmentFromElement(element: Element): string | null {
  if (element instanceof HTMLTableElement) {
    return announceTable(element);
  }

  if (element instanceof HTMLLIElement) {
    const list = element.closest("ul, ol, menu");
    if (list) return announceListItem(element, list);
  }

  if (element instanceof HTMLImageElement) {
    const alt = getAccessibleName(element);
    return alt ? `Image. ${alt}` : null;
  }

  const headingLevel = getHeadingLevel(element);
  const name = getAccessibleName(element);
  if (!name) return null;

  if (headingLevel) return `Heading level ${headingLevel}. ${name}`;

  const tag = element.tagName;
  const role = element.getAttribute("role");
  if (tag === "A" || role === "link") return `Link. ${name}`;
  if (tag === "BUTTON" || role === "button") return `Button. ${name}`;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return `Field. ${name}`;

  return name;
}

function collectSegments(root: Element): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const spokenBlocks = new Set<Element>();

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      const element = node as Element;
      if (shouldSkipElement(element, root)) return NodeFilter.FILTER_REJECT;
      if (isLandmark(element) && element !== root && !READABLE_TAGS.has(element.tagName)) {
        return NodeFilter.FILTER_SKIP;
      }
      if (isReadableBlock(element)) return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_SKIP;
    },
  });

  while (walker.nextNode()) {
    const element = walker.currentNode as Element;
    if (isDescendantOfSpokenBlock(element, spokenBlocks)) continue;

    const text = segmentFromElement(element);
    if (!text) continue;

    segments.push({ element, text });
    spokenBlocks.add(element);
  }

  return segments;
}

function invalidateCacheIfNeeded(pathname: string) {
  if (!contentCache) return;
  if (contentCache.pathname !== pathname || Date.now() - contentCache.builtAt > CACHE_TTL_MS) {
    contentCache = null;
  }
}

export function buildMainContentSegments(pathname = ""): ContentSegment[] {
  const currentPath = pathname || window.location.pathname;
  invalidateCacheIfNeeded(currentPath);

  if (contentCache?.pathname === currentPath) {
    return contentCache.segments;
  }

  const root = getMainRoot();
  if (!root) return [];

  const segments = collectSegments(root);
  contentCache = {
    pathname: currentPath,
    segments,
    builtAt: Date.now(),
  };
  return segments;
}

export function clearContentCache() {
  contentCache = null;
}

export function segmentsToSpeechChunks(segments: ContentSegment[]): string[] {
  const chunks: string[] = [];

  for (const segment of segments) {
    const parts = splitLongText(segment.text, MAX_CHUNK_LENGTH);
    chunks.push(...parts);
  }

  return chunks;
}

function splitLongText(text: string, maxLength: number): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  if (normalized.length <= maxLength) return [normalized];

  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [normalized];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const piece = sentence.trim();
    if (!piece) continue;

    const candidate = current ? `${current} ${piece}`.trim() : piece;
    if (candidate.length <= maxLength) {
      current = candidate;
      continue;
    }

    if (current) chunks.push(current);
    if (piece.length <= maxLength) {
      current = piece;
      continue;
    }

    const words = piece.split(" ");
    current = "";
    for (const word of words) {
      const wordCandidate = current ? `${current} ${word}`.trim() : word;
      if (wordCandidate.length <= maxLength) {
        current = wordCandidate;
      } else {
        if (current) chunks.push(current);
        current = word;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export function extractMainContentText(pathname = ""): string {
  return buildMainContentSegments(pathname)
    .map((segment) => segment.text)
    .join(" ");
}

export function extractSelectedText(): string {
  return normalizeText(window.getSelection()?.toString() ?? "");
}

export function getElementReadableText(element: Element | null): string {
  if (!element || shouldSkipElement(element)) return "";
  return formatAccessibleAnnouncement(element);
}

export function describePageStructureDetailed(root: Element | Document = document): PageStructureSummary {
  const scope = root instanceof Document ? root : root.ownerDocument ?? document;
  const main = scope.getElementById("main-content") ?? scope.querySelector("main") ?? scope.body;
  const title = normalizeText(scope.title);

  const headings = main ? main.querySelectorAll("h1, h2, h3, h4, h5, h6, [role='heading']") : [];
  const links = main ? main.querySelectorAll("a[href], [role='link']") : [];
  const buttons = main ? main.querySelectorAll("button, [role='button'], input[type='button'], input[type='submit']") : [];
  const formFields = main
    ? main.querySelectorAll("input, textarea, select, [role='textbox'], [role='combobox']")
    : [];
  const landmarks = scope.querySelectorAll(
    "header, nav, main, footer, aside, form, [role='banner'], [role='navigation'], [role='main'], [role='contentinfo'], [role='complementary'], [role='search'], [role='form'], [role='region']"
  );

  const sectionHeadings = Array.from(
    main?.querySelectorAll("h1, h2, h3, [role='heading']") ?? []
  )
    .map((heading) => {
      const level = getHeadingLevel(heading) ?? 2;
      const text = getAccessibleName(heading);
      return text ? `Heading level ${level}: ${text}` : "";
    })
    .filter(Boolean)
    .slice(0, 12);

  const counts = {
    headings: headings.length,
    links: links.length,
    buttons: buttons.length,
    formFields: formFields.length,
    landmarks: landmarks.length,
  };

  const parts = [
    title ? `Page title: ${title}.` : "",
    `Landmark regions: ${counts.landmarks}.`,
    `Headings: ${counts.headings}.`,
    `Links: ${counts.links}.`,
    `Buttons: ${counts.buttons}.`,
    `Form fields: ${counts.formFields}.`,
  ].filter(Boolean);

  if (sectionHeadings.length > 0) {
    parts.push(`Major sections: ${sectionHeadings.join(". ")}.`);
  }

  return {
    announcement: parts.join(" "),
    title,
    counts,
    sectionHeadings,
  };
}

export function describePageStructure(): string {
  return describePageStructureDetailed().announcement;
}
