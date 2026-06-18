import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { unlockAchievement, checkStreakAchievements } from "@/lib/engagement/achievements";

export const STREAK_TZ = "Asia/Kolkata";
/** Minimum read time on an article to count toward the daily streak */
export const STREAK_MIN_SECONDS = 60;
/** Or scroll at least this far through an article */
export const STREAK_MIN_PROGRESS = 30;

const STREAK_MILESTONES = [7, 14, 30] as const;

export function istDayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STREAK_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function istDayStart(dayKey: string): Date {
  return new Date(`${dayKey}T00:00:00+05:30`);
}

function addIstDays(dayKey: string, delta: number): string {
  const d = istDayStart(dayKey);
  d.setUTCDate(d.getUTCDate() + delta);
  return istDayKey(d);
}

function rowQualifies(secondsRead: number, progress: number): boolean {
  return secondsRead >= STREAK_MIN_SECONDS || progress >= STREAK_MIN_PROGRESS;
}

async function dayQualified(userId: string, dayKey: string): Promise<boolean> {
  const start = istDayStart(dayKey);
  const end = new Date(start.getTime() + 86_400_000);
  const rows = await prisma.readingHistory.findMany({
    where: { userId, updatedAt: { gte: start, lt: end } },
    select: { secondsRead: true, progress: true },
  });
  return rows.some((r) => rowQualifies(r.secondsRead, r.progress));
}

export type StreakState = {
  streakDays: number;
  longestStreak: number;
  todayQualified: boolean;
  calendar: boolean[];
};

export async function getUserStreakState(
  userId: string
): Promise<StreakState | null> {
  if (!isDatabaseConfigured()) return null;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { streakDays: true, longestStreak: true },
  });
  if (!profile) return null;

  const today = istDayKey();
  const todayQualified = await dayQualified(userId, today);

  const calendar: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const key = addIstDays(today, -i);
    calendar.push(await dayQualified(userId, key));
  }

  return {
    streakDays: profile.streakDays,
    longestStreak: profile.longestStreak,
    todayQualified,
    calendar,
  };
}

async function unlockStreakMilestones(userId: string, streakDays: number) {
  for (const days of STREAK_MILESTONES) {
    if (streakDays < days) continue;
    const code = `streak-${days}` as const;
    await unlockAchievement(userId, code);
  }
  await checkStreakAchievements(userId, streakDays);
}

/** Call after reading progress is saved for a signed-in user. */
export async function maybeExtendReadingStreak(userId: string): Promise<{
  extended: boolean;
  streakDays: number;
} | null> {
  if (!isDatabaseConfigured()) return null;

  const today = istDayKey();
  const qualified = await dayQualified(userId, today);
  if (!qualified) return null;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { streakDays: true, streakLastDate: true, longestStreak: true },
  });
  if (!profile) return null;

  if (profile.streakLastDate === today) {
    return { extended: false, streakDays: profile.streakDays };
  }

  const yesterday = addIstDays(today, -1);
  const newStreak =
    profile.streakLastDate === yesterday ? profile.streakDays + 1 : 1;
  const longest = Math.max(profile.longestStreak, newStreak);

  await prisma.profile.update({
    where: { userId },
    data: {
      streakDays: newStreak,
      streakLastDate: today,
      longestStreak: longest,
      lastActiveAt: new Date(),
    },
  });

  void unlockStreakMilestones(userId, newStreak);

  return { extended: true, streakDays: newStreak };
}
