const IDENTIFIER_KEY = "contentverse.rememberedIdentifier";
const SUGGESTIONS_KEY = "contentverse.loginSuggestions";
const MAX_SUGGESTIONS = 8;

function readSuggestions(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SUGGESTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string" && v.length > 0);
  } catch {
    return [];
  }
}

export function getRememberedIdentifier(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(IDENTIFIER_KEY);
}

export function getLoginSuggestions(): string[] {
  const remembered = getRememberedIdentifier();
  const list = readSuggestions();
  if (remembered && !list.includes(remembered)) {
    return [remembered, ...list];
  }
  return list;
}

export function addLoginSuggestion(identifier: string) {
  if (typeof window === "undefined") return;
  const trimmed = identifier.trim();
  if (!trimmed) return;
  const list = readSuggestions().filter(
    (v) => v.toLowerCase() !== trimmed.toLowerCase()
  );
  list.unshift(trimmed);
  localStorage.setItem(
    SUGGESTIONS_KEY,
    JSON.stringify(list.slice(0, MAX_SUGGESTIONS))
  );
}

export function setRememberedIdentifier(identifier: string | null) {
  if (typeof window === "undefined") return;
  const trimmed = identifier?.trim();
  if (trimmed) {
    localStorage.setItem(IDENTIFIER_KEY, trimmed);
    addLoginSuggestion(trimmed);
  } else {
    localStorage.removeItem(IDENTIFIER_KEY);
  }
}

export function isRememberMeEnabled(): boolean {
  return Boolean(getRememberedIdentifier());
}
