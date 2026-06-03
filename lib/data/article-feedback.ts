import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export type FeedbackStats = {
  helpful: number;
  notHelpful: number;
  userVote: boolean | null;
};

export async function getArticleFeedback(
  blogId: string,
  voterKey?: string | null
): Promise<FeedbackStats> {
  if (!isDatabaseConfigured()) {
    return { helpful: 0, notHelpful: 0, userVote: null };
  }

  const counts = await prisma.articleFeedback.groupBy({
    by: ["helpful"],
    where: { blogId },
    _count: true,
  });

  let helpful = 0;
  let notHelpful = 0;
  for (const row of counts) {
    if (row.helpful) helpful = row._count;
    else notHelpful = row._count;
  }

  let userVote: boolean | null = null;
  if (voterKey) {
    const mine = await prisma.articleFeedback.findUnique({
      where: { blogId_voterKey: { blogId, voterKey } },
    });
    userVote = mine?.helpful ?? null;
  }

  return { helpful, notHelpful, userVote };
}

export async function submitArticleFeedback(input: {
  blogId: string;
  helpful: boolean;
  voterKey: string;
  userId?: string | null;
}) {
  if (!isDatabaseConfigured()) {
    return {
      helpful: input.helpful ? 1 : 0,
      notHelpful: input.helpful ? 0 : 1,
      userVote: input.helpful,
    };
  }

  await prisma.articleFeedback.upsert({
    where: {
      blogId_voterKey: { blogId: input.blogId, voterKey: input.voterKey },
    },
    create: {
      blogId: input.blogId,
      helpful: input.helpful,
      voterKey: input.voterKey,
      userId: input.userId || null,
    },
    update: {
      helpful: input.helpful,
      userId: input.userId || null,
    },
  });

  return getArticleFeedback(input.blogId, input.voterKey);
}
