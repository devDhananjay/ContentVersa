import { SKIP_TAGS } from "@/lib/a11y/constants";

export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function isHidden(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return true;
  if (element.closest("[aria-hidden='true']")) return true;
  if (element.getAttribute("aria-hidden") === "true") return true;
  if (element.hasAttribute("hidden")) return true;

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return true;
  if (style.getPropertyValue("content-visibility") === "hidden") return true;

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0 && element.tagName !== "INPUT") {
    const hasAriaLabel =
      element.hasAttribute("aria-label") || element.hasAttribute("aria-labelledby");
    if (!hasAriaLabel) return true;
  }

  return false;
}

function textFromLabelledBy(element: Element): string {
  const labelledBy = element.getAttribute("aria-labelledby");
  if (!labelledBy) return "";

  return labelledBy
    .split(/\s+/)
    .map((id) => document.getElementById(id))
    .filter((node): node is HTMLElement => node instanceof HTMLElement)
    .map((node) => getAccessibleName(node, { allowRecursion: false }))
    .filter(Boolean)
    .join(". ");
}

function textFromLabels(element: HTMLElement): string {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLButtonElement
  ) {
    if (element.labels && element.labels.length > 0) {
      return Array.from(element.labels)
        .map((label) => normalizeText(label.textContent ?? ""))
        .filter(Boolean)
        .join(". ");
    }
  }
  return "";
}

function textFromFieldValue(element: HTMLElement): string {
  if (element instanceof HTMLInputElement) {
    const type = element.type;
    if (type === "checkbox" || type === "radio") {
      return element.checked ? "checked" : "not checked";
    }
    if (type === "password") {
      return element.value ? "password entered" : "empty";
    }
    return normalizeText(element.value || element.placeholder || "");
  }

  if (element instanceof HTMLTextAreaElement) {
    return normalizeText(element.value || element.placeholder || "");
  }

  if (element instanceof HTMLSelectElement) {
    return normalizeText(
      Array.from(element.selectedOptions)
        .map((option) => option.textContent ?? "")
        .join(", ")
    );
  }

  return "";
}

function visibleText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll(
      "script, style, [aria-hidden='true'], [hidden], .sr-only, [data-a11y-exclude]"
    )
    .forEach((node) => node.remove());
  return normalizeText(clone.innerText || clone.textContent || "");
}

type AccessibleNameOptions = {
  allowRecursion?: boolean;
};

/**
 * Computes an accessible name following common ARIA naming precedence.
 */
export function getAccessibleName(
  element: Element | null,
  options: AccessibleNameOptions = {}
): string {
  if (!element || !(element instanceof HTMLElement)) return "";
  if (SKIP_TAGS.has(element.tagName)) return "";
  if (isHidden(element) && !element.hasAttribute("aria-label")) return "";

  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return normalizeText(ariaLabel);

  const labelledByText = textFromLabelledBy(element);
  if (labelledByText) return labelledByText;

  if (element instanceof HTMLImageElement) {
    const alt = element.getAttribute("alt");
    if (alt) return normalizeText(alt);
    return "";
  }

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const labelText = textFromLabels(element);
    const valueText = textFromFieldValue(element);
    if (labelText && valueText) return `${labelText}, ${valueText}`;
    return labelText || valueText;
  }

  if (element instanceof HTMLSelectElement) {
    const labelText = textFromLabels(element);
    const valueText = textFromFieldValue(element);
    if (labelText && valueText) return `${labelText}, ${valueText}`;
    return labelText || valueText;
  }

  if (element instanceof HTMLLabelElement) {
    return visibleText(element);
  }

  const title = element.getAttribute("title");
  if (title && !visibleText(element)) return normalizeText(title);

  const text = visibleText(element);
  if (text) return text;

  if (options.allowRecursion !== false) {
    const role = element.getAttribute("role");
    if (role === "img") {
      return normalizeText(element.getAttribute("aria-label") || "");
    }
  }

  return "";
}

export function getAccessibleDescription(element: Element | null): string {
  if (!element || !(element instanceof HTMLElement)) return "";
  const describedBy = element.getAttribute("aria-describedby");
  if (!describedBy) return "";

  return describedBy
    .split(/\s+/)
    .map((id) => document.getElementById(id))
    .filter((node): node is HTMLElement => node instanceof HTMLElement)
    .map((node) => normalizeText(node.textContent ?? ""))
    .filter(Boolean)
    .join(". ");
}

export function getRolePrefix(element: Element): string | null {
  const tag = element.tagName;
  const role = element.getAttribute("role");

  if (HEADING_ROLE(tag, role)) {
    const level = headingLevel(element);
    return `Heading level ${level}`;
  }

  if (tag === "A" || role === "link") return "Link";
  if (tag === "BUTTON" || role === "button") return "Button";
  if (tag === "IMG" || role === "img") return "Image";
  if (tag === "LI" || role === "listitem") return "List item";
  if (tag === "TABLE" || role === "table") return "Table";
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || role === "textbox") {
    return "Field";
  }

  return null;
}

function HEADING_ROLE(tag: string, role: string | null) {
  return HEADING_TAGS.has(tag) || role === "heading";
}

const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);

function headingLevel(element: Element): number {
  const tag = element.tagName;
  if (HEADING_TAGS.has(tag)) return Number(tag.slice(1));
  const ariaLevel = element.getAttribute("aria-level");
  return ariaLevel ? Number(ariaLevel) : 2;
}

export function getHeadingLevel(element: Element): number | null {
  const tag = element.tagName;
  const role = element.getAttribute("role");
  if (HEADING_TAGS.has(tag)) return Number(tag.slice(1));
  if (role === "heading") return headingLevel(element);
  return null;
}

export function shouldSkipElement(element: Element, root?: Element | null): boolean {
  if (SKIP_TAGS.has(element.tagName)) return true;
  if (root && !root.contains(element)) return true;
  if (element.closest("[data-a11y-exclude], [aria-label='Accessibility tools']")) return true;
  if (isHidden(element)) return true;
  return false;
}

export function formatAccessibleAnnouncement(element: Element): string {
  const name = getAccessibleName(element);
  if (!name) return "";

  const description = getAccessibleDescription(element);
  const headingLevel = getHeadingLevel(element);
  if (headingLevel) {
    const base = `Heading level ${headingLevel}, ${name}`;
    return description ? `${base}. ${description}` : base;
  }

  const prefix = getRolePrefix(element);
  if (prefix) {
    const base = `${prefix}, ${name}`;
    return description ? `${base}. ${description}` : base;
  }

  return description ? `${name}. ${description}` : name;
}

export function getReadableTarget(element: Element | null): Element | null {
  if (!element) return null;

  const selectors = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "[role='heading']",
    "p",
    "li",
    "blockquote",
    "figcaption",
    "a[href]",
    "button",
    "summary",
    "label",
    "input",
    "textarea",
    "select",
    "table",
    "img[alt]",
    "article",
    "section",
    "[role='button']",
    "[role='link']",
  ].join(",");

  const match = element.closest(selectors);
  return match ?? element;
}
