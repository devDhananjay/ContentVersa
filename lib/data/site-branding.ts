import { cache } from "react";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export type BrandingKey = "logo" | "favicon" | "loader";

export type BrandingAsset = {
  current: string | null;
  previous: string | null;
};

const BRANDING_KEYS: Record<BrandingKey, string> = {
  logo: "branding.logo",
  favicon: "branding.favicon",
  loader: "branding.loader",
};

const EMPTY_BRANDING: Record<BrandingKey, BrandingAsset> = {
  logo: { current: null, previous: null },
  favicon: { current: null, previous: null },
  loader: { current: null, previous: null },
};

function parseAsset(value: unknown): BrandingAsset {
  if (!value || typeof value !== "object") return { current: null, previous: null };
  const row = value as Record<string, unknown>;
  return {
    current: typeof row.current === "string" && row.current.trim() ? row.current.trim() : null,
    previous: typeof row.previous === "string" && row.previous.trim() ? row.previous.trim() : null,
  };
}

export const getBrandingAssets = cache(async (): Promise<Record<BrandingKey, BrandingAsset>> => {
  if (!isDatabaseConfigured()) return { ...EMPTY_BRANDING };

  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: Object.values(BRANDING_KEYS) } },
    });
    const result = { ...EMPTY_BRANDING };
    for (const row of rows) {
      const entry = Object.entries(BRANDING_KEYS).find(([, dbKey]) => dbKey === row.key);
      if (entry) {
        const [assetKey] = entry as [BrandingKey, string];
        result[assetKey] = parseAsset(row.valueJson);
      }
    }
    return result;
  } catch (err) {
    console.error("[branding] load failed", err);
    return { ...EMPTY_BRANDING };
  }
});

export async function setBrandingAsset(key: BrandingKey, url: string): Promise<BrandingAsset> {
  const dbKey = BRANDING_KEYS[key];
  const existing = await prisma.siteSetting.findUnique({ where: { key: dbKey } });
  const prev = parseAsset(existing?.valueJson);
  const next: BrandingAsset = {
    current: url,
    previous: prev.current,
  };

  await prisma.siteSetting.upsert({
    where: { key: dbKey },
    create: { key: dbKey, valueJson: next },
    update: { valueJson: next },
  });

  return next;
}

export async function clearBrandingAsset(key: BrandingKey): Promise<BrandingAsset> {
  const dbKey = BRANDING_KEYS[key];
  const existing = await prisma.siteSetting.findUnique({ where: { key: dbKey } });
  const prev = parseAsset(existing?.valueJson);

  if (!prev.current) {
    return { current: null, previous: prev.previous };
  }

  const next: BrandingAsset = {
    current: null,
    previous: prev.current,
  };

  if (!next.previous) {
    await prisma.siteSetting.deleteMany({ where: { key: dbKey } });
    return { current: null, previous: null };
  }

  await prisma.siteSetting.upsert({
    where: { key: dbKey },
    create: { key: dbKey, valueJson: next },
    update: { valueJson: next },
  });

  return next;
}
