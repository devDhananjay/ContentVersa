import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import type { JobPilotUsageSnapshot } from "@/lib/jobpilot/types";

export const FREE_ANALYSIS_LIMIT = 20;
export const FREE_COVER_LETTER_LIMIT = 10;

export function currentMonthKey(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).slice(0, 7);
}

export async function getOrCreateUsage(userId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }

  const monthKey = currentMonthKey();
  return prisma.jobPilotUsage.upsert({
    where: { userId_monthKey: { userId, monthKey } },
    create: { userId, monthKey },
    update: {},
  });
}

export async function getUsageSnapshot(userId: string): Promise<JobPilotUsageSnapshot> {
  const usage = await getOrCreateUsage(userId);
  const plan: "FREE" | "PRO" = "FREE";
  const analysisLimit = FREE_ANALYSIS_LIMIT;
  const coverLetterLimit = FREE_COVER_LETTER_LIMIT;

  return {
    monthKey: usage.monthKey,
    analysisCount: usage.analysisCount,
    coverLetterCount: usage.coverLetterCount,
    answerCount: usage.answerCount,
    analysisLimit,
    coverLetterLimit,
    analysisRemaining: Math.max(0, analysisLimit - usage.analysisCount),
    coverLetterRemaining: Math.max(0, coverLetterLimit - usage.coverLetterCount),
    plan,
  };
}

export async function assertCanAnalyze(userId: string) {
  const snap = await getUsageSnapshot(userId);
  if (snap.analysisRemaining <= 0) {
    throw new Error("ANALYSIS_LIMIT");
  }
}

export async function assertCanCoverLetter(userId: string) {
  const snap = await getUsageSnapshot(userId);
  if (snap.coverLetterRemaining <= 0) {
    throw new Error("COVER_LETTER_LIMIT");
  }
}

export async function incrementAnalysis(userId: string) {
  const monthKey = currentMonthKey();
  await prisma.jobPilotUsage.upsert({
    where: { userId_monthKey: { userId, monthKey } },
    create: { userId, monthKey, analysisCount: 1 },
    update: { analysisCount: { increment: 1 } },
  });
}

export async function incrementCoverLetter(userId: string) {
  const monthKey = currentMonthKey();
  await prisma.jobPilotUsage.upsert({
    where: { userId_monthKey: { userId, monthKey } },
    create: { userId, monthKey, coverLetterCount: 1 },
    update: { coverLetterCount: { increment: 1 } },
  });
}
