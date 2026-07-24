import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { generatePollFromArticle, buildHeuristicPoll } from "@/lib/ai/assist";
import { getPollDefBySlug } from "@/lib/polls/catalog";

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
  question: "Do you think AI will replace most creative jobs by 2030?",
  options: ["Yes", "No", "Maybe", "Only parts of the work"],
};

function pollSlugForBlog(blogSlug: string) {
  return `blog-${blogSlug}`;
}

/** Create a homepage daily poll from catalog if missing. */
export async function ensureDailyPoll(slug: string) {
  if (!isDatabaseConfigured()) return null;

  const def = getPollDefBySlug(slug);
  if (!def) return null;

  let poll = await prisma.poll.findUnique({
    where: { slug },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });

  if (!poll) {
    poll = await prisma.poll.create({
      data: {
        slug: def.slug,
        question: def.question,
        isActive: true,
        options: {
          create: def.options.map((label, i) => ({
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

export async function ensureFeaturedPoll() {
  return ensureDailyPoll(DEFAULT_POLL.slug);
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
    const catalogDef = getPollDefBySlug(slug);
    if (catalogDef) {
      return mapPollDto(
        {
          id: `mock-${slug}`,
          slug: catalogDef.slug,
          question: catalogDef.question,
          options: catalogDef.options.map((label, i) => ({
            id: `mock-${slug}-${i}`,
            label,
          })),
        },
        voterKey
      );
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
      : getPollDefBySlug(slug)
        ? await ensureDailyPoll(slug)
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

/** Writer-inserted 1-question poll (```poll fence). Creates once, then reuses. */
export async function ensureInlinePoll(input: {
  slug: string;
  question: string;
  options: string[];
}) {
  const options = input.options
    .map((o) => o.trim())
    .filter(Boolean)
    .slice(0, 6);
  const question = input.question.trim();
  if (!question || options.length < 2) return null;

  if (!isDatabaseConfigured()) {
    return {
      id: `mock-${input.slug}`,
      slug: input.slug,
      question,
      isActive: true,
      options: options.map((label, i) => ({
        id: `mock-${input.slug}-${i}`,
        label,
        sortOrder: i,
      })),
    };
  }

  let poll = await prisma.poll.findUnique({
    where: { slug: input.slug },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });

  if (!poll) {
    poll = await prisma.poll.create({
      data: {
        slug: input.slug,
        question,
        isActive: true,
        options: {
          create: options.map((label, i) => ({
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

export async function getInlinePoll(
  input: { slug: string; question: string; options: string[] },
  voterKey?: string | null
) {
  const poll = await ensureInlinePoll(input);
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
