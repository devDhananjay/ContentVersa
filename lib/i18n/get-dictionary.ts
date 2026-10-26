import type { AppLocale } from "@/lib/i18n/config";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";

export type Dictionary = typeof en;

const dictionaries: Record<AppLocale, Dictionary> = {
  en,
  hi: hi as Dictionary,
};

export function getDictionary(locale: AppLocale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

/** Dot-path lookup, e.g. t(dict, "nav.write") */
export function t(
  dict: Dictionary,
  path: string,
  fallback?: string
): string {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return fallback ?? path;
    }
  }
  return typeof cur === "string" ? cur : fallback ?? path;
}

/** Replace `{key}` placeholders in a translated string. */
export function tf(
  dict: Dictionary,
  path: string,
  vars: Record<string, string | number>,
  fallback?: string
): string {
  let out = t(dict, path, fallback);
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, String(v));
  }
  return out;
}
