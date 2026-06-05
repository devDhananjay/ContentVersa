const CREDENTIALS_KEY = "contentverse.rememberedCredentials";
const LEGACY_IDENTIFIER_KEY = "contentverse.rememberedIdentifier";
const SUGGESTIONS_KEY = "contentverse.loginSuggestions";
const MAX_SUGGESTIONS = 8;

export type RememberedCredentials = {
  identifier: string;
  password: string;
};

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

export function getRememberedCredentials(): RememberedCredentials | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<RememberedCredentials>;
      if (parsed.identifier?.trim()) {
        return {
          identifier: parsed.identifier.trim(),
          password: typeof parsed.password === "string" ? parsed.password : "",
        };
      }
    }
  } catch {
    /* fall through to legacy key */
  }

  const legacy = localStorage.getItem(LEGACY_IDENTIFIER_KEY)?.trim();
  if (legacy) return { identifier: legacy, password: "" };

  return null;
}

/** @deprecated Use getRememberedCredentials */
export function getRememberedIdentifier(): string | null {
  return getRememberedCredentials()?.identifier ?? null;
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

export function setRememberedCredentials(
  identifier: string,
  password: string
) {
  if (typeof window === "undefined") return;
  const id = identifier.trim();
  if (!id) return;

  localStorage.setItem(
    CREDENTIALS_KEY,
    JSON.stringify({ identifier: id, password })
  );
  localStorage.removeItem(LEGACY_IDENTIFIER_KEY);
  addLoginSuggestion(id);
}

export function clearRememberedCredentials() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CREDENTIALS_KEY);
  localStorage.removeItem(LEGACY_IDENTIFIER_KEY);
}

/** @deprecated Use setRememberedCredentials / clearRememberedCredentials */
export function setRememberedIdentifier(identifier: string | null) {
  if (!identifier?.trim()) {
    clearRememberedCredentials();
    return;
  }
  setRememberedCredentials(identifier, "");
}

export function isRememberMeEnabled(): boolean {
  return Boolean(getRememberedCredentials());
}
