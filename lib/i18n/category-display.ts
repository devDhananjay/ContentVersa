import type { AppLocale } from "@/lib/i18n/config";

/** Pick category label for locale (falls back to English name). */
export function categoryDisplayName(
  category: { name: string; nameHi?: string | null } | null | undefined,
  locale: AppLocale
): string {
  if (!category) return "";
  if (locale === "hi" && category.nameHi?.trim()) return category.nameHi.trim();
  return category.name;
}
