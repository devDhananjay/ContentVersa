import { NotificationType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { createUserNotification } from "@/lib/notifications/create";

export const ACHIEVEMENT_CATALOG = [
  {
    code: "first-post",
    title: "First Post",
    description: "Published your first article on ContentVerse.",
    icon: "📝",
  },
  {
    code: "first-comment",
    title: "Conversation Starter",
    description: "Left your first comment on an article.",
    icon: "💬",
  },
  {
    code: "top-creator",
    title: "Rising Creator",
    description: "Published 5+ articles with 1,000+ total views.",
    icon: "🏆",
  },
  {
    code: "marathon",
    title: "Marathon Reader",
    description: "Maintained a 12-day reading streak.",
    icon: "🔥",
  },
  {
    code: "viral-hit",
    title: "Viral Hit",
    description: "A post crossed 10,000 views.",
    icon: "🚀",
  },
  {
    code: "ai-week-5",
    title: "AI Explorer",
    description: "Read 5 AI articles this week.",
    icon: "🤖",
  },
  {
    code: "referral-bonus",
    title: "Community Builder",
    description: "Invited a friend who joined ContentVerse.",
    icon: "🎁",
  },
  {
    code: "streak-7",
    title: "Week Warrior",
    description: "7-day reading streak.",
    icon: "🔥",
  },
  {
    code: "streak-14",
    title: "Fortnight Reader",
    description: "14-day reading streak.",
    icon: "🔥",
  },
  {
    code: "streak-30",
    title: "Marathon Reader",
    description: "30-day reading streak.",
    icon: "🔥",
  },
] as const;

export type AchievementCode = (typeof ACHIEVEMENT_CATALOG)[number]["code"];

export async function unlockAchievement(
  userId: string,
  code: AchievementCode
): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;

  const meta = ACHIEVEMENT_CATALOG.find((a) => a.code === code);
  if (!meta) return false;

  const achievement = await prisma.achievement.upsert({
    where: { code },
    create: {
      code: meta.code,
      title: meta.title,
      description: meta.description,
      icon: meta.icon,
    },
    update: {
      title: meta.title,
      description: meta.description,
      icon: meta.icon,
    },
  });

  const existing = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: { userId, achievementId: achievement.id },
    },
  });
  if (existing) return false;

  await prisma.userAchievement.create({
    data: { userId, achievementId: achievement.id },
  });

  await createUserNotification({
    userId,
    type: NotificationType.SYSTEM,
    title: `Achievement unlocked: ${meta.title}`,
    message: meta.description,
    link: "/dashboard/achievements",
  });

  return true;
}

/** After publishing — first post, viral hit, rising creator */
export async function checkPublishAchievements(
  userId: string,
  blog: { views: number }
) {
  if (!isDatabaseConfigured()) return;

  const publishedCount = await prisma.blog.count({
    where: { authorId: userId, status: "PUBLISHED" },
  });

  if (publishedCount === 1) {
    await unlockAchievement(userId, "first-post");
  }

  if (blog.views >= 10_000) {
    await unlockAchievement(userId, "viral-hit");
  }

  if (publishedCount >= 5) {
    const agg = await prisma.blog.aggregate({
      where: { authorId: userId, status: "PUBLISHED" },
      _sum: { views: true },
    });
    if ((agg._sum.views ?? 0) >= 1000) {
      await unlockAchievement(userId, "top-creator");
    }
  }
}

/** After commenting — first comment badge */
export async function checkCommentAchievements(userId: string) {
  if (!isDatabaseConfigured()) return;

  const count = await prisma.comment.count({ where: { userId } });
  if (count === 1) {
    await unlockAchievement(userId, "first-comment");
  }
}

/** After streak extends — marathon at 12 days (non-milestone badge) */
export async function checkStreakAchievements(userId: string, streakDays: number) {
  if (streakDays >= 12) {
    await unlockAchievement(userId, "marathon");
  }
}
