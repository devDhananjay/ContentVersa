import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { generatePollFromArticle, buildHeuristicPoll } from "@/lib/ai/assist";

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

function pollSlugForBlog(blogSlug: string) {
  return `blog-${blogSlug}`;
}

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

/** Create or fetch a poll tied to a specific blog article. */
export async function ensureBlogPoll(input: {
  blogId?: string;
  blogSlug: string;
  title: string;
  category?: string;
  tags?: string[];
  excerpt?: string;
}) {
  const slug = pollSlugForBlog(input.blogSlug);

  if (!isDatabaseConfigured()) {
    return mockBlogPoll(slug, input);
  }

  let poll = await prisma.poll.findUnique({
    where: { slug },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });

  if (!poll) {
    const generated = await generatePollFromArticle({
      title: input.title,
      category: input.category,
      tags: input.tags,
      excerpt: input.excerpt,
    });

    poll = await prisma.poll.create({
      data: {
        slug,
        question: generated.question,
        blogId: input.blogId || null,
        isActive: true,
        options: {
          create: generated.options.map((label, i) => ({
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

function mockBlogPoll(
  slug: string,
  input: { title: string; category?: string; tags?: string[] }
) {
  const generated = buildHeuristicPoll(input);
  return {
    id: `mock-${slug}`,
    slug,
    question: generated.question,
    isActive: true,
    options: generated.options.map((label, i) => ({
      id: `mock-opt-${slug}-${i}`,
      label,
      sortOrder: i,
    })),
  };
}

async function mapPollDto(
  poll: {
    id: string;
    slug: string;
    question: string;
    options: { id: string; label: string }[];
  },
  voterKey?: string | null
): Promise<PollDto> {
  if (!isDatabaseConfigured()) {
    const votes = poll.options.map((_, i) => 12 + i * 7);
    const total = votes.reduce((a, b) => a + b, 0);
    return {
      id: poll.id,
      slug: poll.slug,
      question: poll.question,
      totalVotes: total,
      userVoteOptionId: null,
      options: poll.options.map((o, i) => ({
        id: o.id,
        label: o.label,
        votes: votes[i],
        percent: total ? Math.round((votes[i] / total) * 100) : 0,
      })),
    };
  }

  const voteCounts = await prisma.pollVote.groupBy({
    by: ["optionId"],
    where: { pollId: poll.id },
    _count: true,
  });
  const countMap = new Map(voteCounts.map((v) => [v.optionId, v._count]));
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

export async function getPollBySlug(
  slug: string,
  voterKey?: string | null
): Promise<PollDto | null> {
  if (!isDatabaseConfigured()) {
    if (slug.startsWith("blog-")) {
      const blogSlug = slug.replace(/^blog-/, "");
      const mock = mockBlogPoll(slug, {
        title: blogSlug.replace(/-/g, " "),
        category: "technology",
      });
      return mapPollDto(mock, voterKey);
    }
    if (slug === DEFAULT_POLL.slug) {
      return mapPollDto(
        {
          id: "mock-poll",
          slug: DEFAULT_POLL.slug,
          question: DEFAULT_POLL.question,
          options: DEFAULT_POLL.options.map((label, i) => ({
            id: `mock-${i}`,
            label,
          })),
        },
        voterKey
      );
    }
    return null;
  }

  const poll =
    slug === DEFAULT_POLL.slug
      ? await ensureFeaturedPoll()
      : await prisma.poll.findUnique({
          where: { slug },
          include: { options: { orderBy: { sortOrder: "asc" } } },
        });

  if (!poll) return null;
  return mapPollDto(poll, voterKey);
}

export async function getPollForBlog(
  input: {
    blogId?: string;
    blogSlug: string;
    title: string;
    category?: string;
    tags?: string[];
    excerpt?: string;
  },
  voterKey?: string | null
) {
  const poll = await ensureBlogPoll(input);
  if (!poll) return null;
  return mapPollDto(poll, voterKey);
}

export async function castPollVote(
  pollSlug: string,
  optionId: string,
  voterKey: string
) {
  if (!isDatabaseConfigured()) {
    return getPollBySlug(pollSlug, voterKey);
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

export { pollSlugForBlog };
