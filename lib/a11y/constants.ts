/** Regions excluded from automated reading (toolbar, live regions, etc.). */
export const A11Y_EXCLUDE_SELECTOR = [
  "[data-a11y-exclude]",
  "[aria-label='Accessibility tools']",
  "[role='status']",
  "[aria-live]",
  ".sr-only",
  "[hidden]",
].join(", ");

export const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEMPLATE",
  "SVG",
  "PATH",
  "IFRAME",
  "OBJECT",
  "EMBED",
]);

export const LANDMARK_ROLES = new Set([
  "banner",
  "navigation",
  "main",
  "contentinfo",
  "complementary",
  "search",
  "form",
  "region",
]);

export const READABLE_TAGS = new Set([
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "P",
  "LI",
  "DT",
  "DD",
  "BLOCKQUOTE",
  "FIGCAPTION",
  "A",
  "BUTTON",
  "SUMMARY",
  "LABEL",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "TABLE",
  "IMG",
  "FIGURE",
  "ARTICLE",
  "SECTION",
]);

export const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);

export const MAX_CHUNK_LENGTH = 240;

export const FOCUS_DEBOUNCE_MS = 320;
export const POINTER_THROTTLE_MS = 480;
export const ROUTE_READ_DELAY_MS = 450;
