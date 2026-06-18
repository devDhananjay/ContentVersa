import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { unlockAchievement } from "@/lib/engagement/achievements";
import { istDayKey } from "@/lib/engagement/streak";

function weekStartKey(dayKey = istDayKey()): string {
  const d = new Date(`${dayKey}T12:00:00+05:30`);
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return istDayKey(d);
}

/** "Read 5 AI articles this week" — counts distinct blogs in AI category */
export async function checkWeeklyAiReadingChallenge(userId: string) {
  if (!isDatabaseConfigured()) return { read: 0, goal: 5, complete: false };

  const startKey = weekStartKey();
  const start = new Date(`${startKey}T00:00:00+05:30`);

  const rows = await prisma.readingHistory.findMany({
    where: {
      userId,
      updatedAt: { gte: start },
      OR: [
        { category: { in: ["ai", "AI", "artificial-intelligence"] } },
        { category: { contains: "ai", mode: "insensitive" } },
      ],
      progress: { gte: 30 },
    },
    select: { blogId: true },
    distinct: ["blogId"],
  });

  const read = rows.length;
  const goal = 5;
  const complete = read >= goal;

  if (complete) {
    await unlockAchievement(userId, "ai-week-5");
  }

  return { read, goal, complete };
}
