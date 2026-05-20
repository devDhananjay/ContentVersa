import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export type PollDto = {
  id: string;
  slug: string;
  question: string;
  options: { id: string; label: string; votes: number; percent: number }[];
  totalVotes: number;
  userVoteOptionId: string | null;
};

const DEFAULT_POLL = {
  slug: "ai-replace-jobs",
  question: "Do you think AI will replace jobs?",
  options: ["Yes", "No", "Maybe"],
};

export async function ensureFeaturedPoll() {
  if (!isDatabaseConfigured()) return null;

  let poll = await prisma.poll.findUnique({
    where: { slug: DEFAULT_POLL.slug },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });

  if (!poll) {
    poll = await prisma.poll.create({
      data: {
        slug: DEFAULT_POLL.slug,
        question: DEFAULT_POLL.question,
        isActive: true,
        options: {
          create: DEFAULT_POLL.options.map((label, i) => ({
            label,
            sortOrder: i,
          })),
        },
      },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });
  }

  return poll;
}

export async function getPollBySlug(
  slug: string,
  voterKey?: string | null
): Promise<PollDto | null> {
  if (!isDatabaseConfigured()) {
    return mockPoll(slug, voterKey);
  }

  const poll =
    slug === DEFAULT_POLL.slug
      ? await ensureFeaturedPoll()
      : await prisma.poll.findUnique({
          where: { slug },
          include: { options: { orderBy: { sortOrder: "asc" } } },
        });

  if (!poll) return mockPoll(slug, voterKey);

  const voteCounts = await prisma.pollVote.groupBy({
    by: ["optionId"],
    where: { pollId: poll.id },
    _count: true,
  });
  const countMap = new Map(
    voteCounts.map((v) => [v.optionId, v._count])
  );
  const totalVotes = voteCounts.reduce((s, v) => s + v._count, 0);

  let userVoteOptionId: string | null = null;
  if (voterKey) {
    const mine = await prisma.pollVote.findUnique({
      where: { pollId_voterKey: { pollId: poll.id, voterKey } },
    });
    userVoteOptionId = mine?.optionId ?? null;
  }

  return {
    id: poll.id,
    slug: poll.slug,
    question: poll.question,
    totalVotes,
    userVoteOptionId,
    options: poll.options.map((o) => {
      const votes = countMap.get(o.id) ?? 0;
      return {
        id: o.id,
        label: o.label,
        votes,
        percent: totalVotes ? Math.round((votes / totalVotes) * 100) : 0,
      };
    }),
  };
}

function mockPoll(slug: string, voterKey?: string | null): PollDto | null {
  if (slug !== DEFAULT_POLL.slug) return null;
  const stored =
    typeof globalThis !== "undefined"
      ? null
      : null;
  void stored;
  const votes = [42, 28, 30];
  const total = votes.reduce((a, b) => a + b, 0);
  const labels = DEFAULT_POLL.options;
  return {
    id: "mock-poll",
    slug: DEFAULT_POLL.slug,
    question: DEFAULT_POLL.question,
    totalVotes: total,
    userVoteOptionId: null,
    options: labels.map((label, i) => ({
      id: `mock-${i}`,
      label,
      votes: votes[i],
      percent: total ? Math.round((votes[i] / total) * 100) : 0,
    })),
  };
}

export async function castPollVote(
  pollSlug: string,
  optionId: string,
  voterKey: string
) {
  if (!isDatabaseConfigured()) {
    return { ok: true, demo: true };
  }

  const poll = await prisma.poll.findUnique({
    where: { slug: pollSlug },
    include: { options: true },
  });
  if (!poll || !poll.isActive) throw new Error("POLL_NOT_FOUND");

  const option = poll.options.find((o) => o.id === optionId);
  if (!option) throw new Error("INVALID_OPTION");

  await prisma.pollVote.upsert({
    where: { pollId_voterKey: { pollId: poll.id, voterKey } },
    create: { pollId: poll.id, optionId, voterKey },
    update: { optionId },
  });

  return getPollBySlug(pollSlug, voterKey);
}
