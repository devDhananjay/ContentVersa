import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/data/categories";

const KEY = "ai.daily_articles_enabled";

/** Always included when daily AI scheduling is enabled (high-traffic OTT / release angles). */
export const AI_AUTO_GEN_ALWAYS_ON = ["movies"] as const;

export type AiAutoGenSettings = {
  enabled: boolean;
  /** User-selected slugs (excludes always-on). */
  categorySlugs: string[];
  /** Effective slugs used by cron = always-on ∪ user selection. */
  activeCategorySlugs: string[];
};

function normalizeSlugs(slugs: unknown): string[] {
  if (!Array.isArray(slugs)) return [];
  const valid = new Set(CATEGORIES.map((c) => c.slug));
  return [...new Set(slugs.filter((s): s is string => typeof s === "string" && valid.has(s)))];
}

function mergeActive(userSlugs: string[]): string[] {
  const valid = new Set(CATEGORIES.map((c) => c.slug));
  return [...new Set([...AI_AUTO_GEN_ALWAYS_ON, ...userSlugs])].filter((s) => valid.has(s));
}

export async function getAiAutoGenSettings(): Promise<AiAutoGenSettings> {
  if (!isDatabaseConfigured()) {
    return { enabled: false, categorySlugs: [], activeCategorySlugs: [...AI_AUTO_GEN_ALWAYS_ON] };
  }
  const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
  const json = (row?.valueJson ?? {}) as {
    enabled?: boolean;
    categorySlugs?: unknown;
  };

  const enabled = json.enabled === true;
  // Backward compat: no saved list → all categories (previous nightly cron behaviour).
  const categorySlugs =
    json.categorySlugs === undefined
      ? CATEGORIES.map((c) => c.slug).filter((s) => !AI_AUTO_GEN_ALWAYS_ON.includes(s as (typeof AI_AUTO_GEN_ALWAYS_ON)[number]))
      : normalizeSlugs(json.categorySlugs).filter(
          (s) => !AI_AUTO_GEN_ALWAYS_ON.includes(s as (typeof AI_AUTO_GEN_ALWAYS_ON)[number])
        );

  return {
    enabled,
    categorySlugs,
    activeCategorySlugs: mergeActive(categorySlugs),
  };
}

export async function isAiAutoGenEnabled(): Promise<boolean> {
  const { enabled } = await getAiAutoGenSettings();
  return enabled;
}

export async function getAiAutoGenCategorySlugs(): Promise<string[]> {
  const { enabled, activeCategorySlugs } = await getAiAutoGenSettings();
  if (!enabled) return [];
  return activeCategorySlugs;
}

export async function setAiAutoGenEnabled(enabled: boolean): Promise<void> {
  const current = await getAiAutoGenSettings();
  await saveSettings({ enabled, categorySlugs: current.categorySlugs });
}

export async function setAiAutoGenCategories(categorySlugs: string[]): Promise<void> {
  const current = await getAiAutoGenSettings();
  const userSlugs = normalizeSlugs(categorySlugs).filter(
    (s) => !AI_AUTO_GEN_ALWAYS_ON.includes(s as (typeof AI_AUTO_GEN_ALWAYS_ON)[number])
  );
  await saveSettings({ enabled: current.enabled, categorySlugs: userSlugs });
}

async function saveSettings(input: { enabled: boolean; categorySlugs: string[] }): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await prisma.siteSetting.upsert({
    where: { key: KEY },
    create: {
      key: KEY,
      valueJson: {
        enabled: input.enabled,
        categorySlugs: input.categorySlugs,
      },
    },
    update: {
      valueJson: {
        enabled: input.enabled,
        categorySlugs: input.categorySlugs,
      },
    },
  });
}
