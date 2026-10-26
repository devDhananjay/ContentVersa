/**
 * Phase 0 — locked product rules for EN/HI bilingual ContentVerse.
 *
 * Free mode (default): UI i18n only — no paid Translate API, no auto Gemini
 * content translation. Set ENABLE_AI_HI_TRANSLATE=1 later when ready to spend quota.
 */

export const I18N_POLICY = {
  /** Authors write this language first by default. */
  primaryLocale: "en" as const,
  supportedLocales: ["en", "hi"] as const,

  /**
   * Niches that must NOT auto-publish raw machine Hindi.
   * HI stays DRAFT until admin/human approves.
   */
  requireHumanApproveForHi: [
    "money",
    "finance",
    "jobs",
    "govt-schemes",
    "schemes",
    "tax",
    "insurance",
    "health",
  ] as const,

  /**
   * Soft-fallback to English article body when HI missing.
   * Free mode: allow fallback everywhere so /hi/* stays usable (UI Hindi + EN body + banner).
   */
  softFallbackToEn: {
    news: true,
    blogs: true,
    guides: true,
    money: true,
    jobs: true,
  } as const,

  /** Off while free — never burn Gemini on every publish. */
  autoEnqueueHiOnPublish: false,

  /** Never hard-redirect by Accept-Language (banner only). */
  hardRedirectByBrowserLang: false,
} as const;

export type SoftFallbackSection = keyof typeof I18N_POLICY.softFallbackToEn;

/** AI content translate (Gemini) — default OFF to save free quota. */
export function isAiHiTranslateEnabled(): boolean {
  return process.env.ENABLE_AI_HI_TRANSLATE === "1";
}

export function categoryNeedsHiApproval(categorySlug?: string | null): boolean {
  if (!categorySlug) return false;
  const s = categorySlug.toLowerCase();
  return I18N_POLICY.requireHumanApproveForHi.some(
    (k) => s === k || s.includes(k)
  );
}

export function allowsSoftFallback(section: SoftFallbackSection): boolean {
  return I18N_POLICY.softFallbackToEn[section];
}
