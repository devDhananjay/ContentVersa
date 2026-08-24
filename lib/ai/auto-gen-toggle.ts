import { prisma, isDatabaseConfigured } from "@/lib/prisma";

const KEY = "ai.daily_articles_enabled";

export async function isAiAutoGenEnabled(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
  if (!row) return true; // enabled by default
  return (row.valueJson as { enabled?: boolean })?.enabled !== false;
}

export async function setAiAutoGenEnabled(enabled: boolean): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await prisma.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, valueJson: { enabled } },
    update: { valueJson: { enabled } },
  });
}
