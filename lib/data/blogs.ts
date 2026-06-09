// Mock content used until the database is wired up.
// Replace these reads with Prisma queries — the shapes are designed to match `Blog`.

export interface Author {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  verified: boolean;
  followers: number;
  blogs: number;
}

export interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  readingTime: number;
  views: number;
  likes: number;
  comments: number;
  category: string;
  tags: string[];
  publishedAt: string;
  author: Author;
  featured?: boolean;
  editorPick?: boolean;
  trending?: boolean;
  premium?: boolean;
}

export const AUTHORS: Author[] = [
  {
    id: "u_aarav",
    name: "Aarav Mehta",
    username: "aaravbuilds",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Aarav",
    bio: "Building at the edge of AI and design systems.",
    verified: true,
    followers: 48200,
    blogs: 41,
  },
  {
    id: "u_zara",
    name: "Zara Khan",
    username: "zaracodes",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Zara",
    bio: "Full-stack engineer writing about TypeScript, DX and shipping fast.",
    verified: true,
    followers: 31900,
    blogs: 28,
  },
  {
    id: "u_kai",
    name: "Kai Watanabe",
    username: "kai",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Kai",
    bio: "Founder. Writing about startups, fundraising and product-market fit.",
    verified: true,
    followers: 22100,
    blogs: 19,
  },
  {
    id: "u_riya",
    name: "Riya Sharma",
    username: "riya",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Riya",
    bio: "Designer-developer. Aesthetic obsessive. Notes on craft & culture.",
    verified: false,
    followers: 11400,
    blogs: 33,
  },
  {
    id: "u_jordan",
    name: "Jordan Lee",
    username: "jordan",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Jordan",
    bio: "Marketer, growth nerd. Building loops > funnels.",
    verified: true,
    followers: 18750,
    blogs: 24,
  },
  {
    id: "u_maya",
    name: "Maya Iyer",
    username: "mayatalks",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Maya",
    bio: "Writer at the intersection of psychology and the internet.",
    verified: false,
    followers: 9800,
    blogs: 15,
  },
];

const baseCover = (id: string, q = 1600) =>
  `https://images.unsplash.com/${id}?w=${q}&auto=format&fit=crop`;

const longContent = (intro: string) => `
# ${intro}

In a world where attention is the new currency, the way we publish and consume content matters more than ever. This post explores what it takes to build a creator-first ecosystem that's actually addictive in a good way — premium feel, real depth, and tools that make great work easier.

## The thesis

Most platforms optimize for the platform. **ContentVerse optimizes for the creator.** The reading experience is the surface area, but the engine is the editor, the moderation pipeline, and the way revenue actually flows back to people who do the work.

> "Software is feelings made executable. Build for how people want to feel when they ship."

## What changes when you center the creator

- **Editor that thinks in blocks.** Slash commands, embeds, AI completions — text gets out of your way.
- **Submission flow that respects you.** No black box. Real feedback. Faster approvals.
- **Monetization that compounds.** Tips, paid posts, subscriptions, ad shares — stack the model.

\`\`\`ts
// A tiny example of the kind of DX we ship
export async function publishBlog(input: BlogInput) {
  const draft = await blog.draft(input);
  const review = await mod.queue(draft);
  return review.status === "APPROVED" ? blog.publish(draft) : draft;
}
\`\`\`

## What's next

The next decade of the internet belongs to people who can write, build and ship across formats. ContentVerse is the home base for that work — fast, beautiful, and on your side.
`;

export const BLOGS: Blog[] = [
  {
    id: "b1",
    slug: "the-shipping-mindset-2026-creators",
    title: "The Shipping Mindset: How 2026 Creators Outperform Studios",
    excerpt:
      "Solo creators are out-shipping legacy studios. Here's the operating system behind the people setting the pace this year.",
    content: longContent("The Shipping Mindset: How 2026 Creators Outperform Studios"),
    coverImage: baseCover("photo-1517245386807-bb43f82c33c4"),
    readingTime: 8,
    views: 124_000,
    likes: 8_420,
    comments: 312,
    category: "startups",
    tags: ["creator-economy", "startups", "shipping"],
    publishedAt: "2026-05-12",
    author: AUTHORS[2],
    featured: true,
    editorPick: true,
    trending: true,
  },
  {
    id: "b2",
    slug: "designing-with-ai-agents-2026",
    title: "Designing With AI Agents: The New Front-End Stack",
    excerpt:
      "Agents are now part of the UI. A practical guide to designing for products where the user, the model and the interface collaborate.",
    content: longContent("Designing With AI Agents: The New Front-End Stack"),
    coverImage: baseCover("photo-1677442136019-21780ecad995"),
    readingTime: 11,
    views: 89_500,
    likes: 6_120,
    comments: 198,
    category: "ai",
    tags: ["ai", "agents", "ux"],
    publishedAt: "2026-05-08",
    author: AUTHORS[0],
    featured: true,
    trending: true,
  },
  {
    id: "b3",
    slug: "typescript-patterns-i-use-every-day",
    title: "TypeScript Patterns I Use Every Day",
    excerpt:
      "Branded types, discriminated unions, and the small composable patterns that hold up in real production code.",
    content: longContent("TypeScript Patterns I Use Every Day"),
    coverImage: baseCover("photo-1555066931-4365d14bab8c"),
    readingTime: 9,
    views: 56_300,
    likes: 4_810,
    comments: 142,
    category: "programming",
    tags: ["typescript", "patterns", "dx"],
    publishedAt: "2026-05-05",
    author: AUTHORS[1],
    editorPick: true,
  },
  {
    id: "b4",
    slug: "from-idea-to-1m-arr-in-9-months",
    title: "From Idea to $1M ARR in 9 Months: A Founder Playbook",
    excerpt:
      "What we built, what we threw away, and the four levers that mattered more than every other decision combined.",
    content: longContent("From Idea to $1M ARR in 9 Months"),
    coverImage: baseCover("photo-1664575599736-c5197c684128"),
    readingTime: 14,
    views: 201_700,
    likes: 12_340,
    comments: 524,
    category: "startups",
    tags: ["founders", "growth", "playbook"],
    publishedAt: "2026-05-01",
    author: AUTHORS[2],
    trending: true,
    premium: true,
  },
  {
    id: "b5",
    slug: "the-aesthetic-engineer",
    title: "The Aesthetic Engineer: Why Designers Are the New 10x Devs",
    excerpt:
      "The next decade of software belongs to people who can taste, ship, and write. Notes from an aesthetic engineer in the wild.",
    content: longContent("The Aesthetic Engineer"),
    coverImage: baseCover("photo-1517245386807-bb43f82c33c4"),
    readingTime: 7,
    views: 41_200,
    likes: 3_220,
    comments: 88,
    category: "lifestyle",
    tags: ["design", "engineering", "craft"],
    publishedAt: "2026-04-28",
    author: AUTHORS[3],
    editorPick: true,
  },
  {
    id: "b6",
    slug: "growth-loops-over-funnels",
    title: "Growth Loops Over Funnels: A 2026 Marketing Primer",
    excerpt:
      "Funnels leak. Loops compound. The shift in mental model that separates flat businesses from breakaway ones.",
    content: longContent("Growth Loops Over Funnels"),
    coverImage: baseCover("photo-1432888622747-4eb9a8efeb07"),
    readingTime: 10,
    views: 78_400,
    likes: 5_140,
    comments: 174,
    category: "marketing",
    tags: ["growth", "marketing", "loops"],
    publishedAt: "2026-04-22",
    author: AUTHORS[4],
    trending: true,
  },
  {
    id: "b7",
    slug: "the-internet-loneliness-loop",
    title: "The Internet Loneliness Loop (And How To Step Out)",
    excerpt:
      "On the strange paradox of being more connected than ever and lonelier than ever — and what actually helps.",
    content: longContent("The Internet Loneliness Loop"),
    coverImage: baseCover("photo-1582719188393-bb71ca45dbb9"),
    readingTime: 6,
    views: 33_900,
    likes: 4_120,
    comments: 220,
    category: "psychology",
    tags: ["internet", "psychology", "wellness"],
    publishedAt: "2026-04-18",
    author: AUTHORS[5],
  },
  {
    id: "b8",
    slug: "after-hours-the-night-stack",
    title: "After Hours: The Night Stack of a Solo Dev",
    excerpt:
      "What it looks like to run a one-person product company from 9pm to 1am — tools, rituals and a few late-night truths.",
    content: longContent("After Hours: The Night Stack of a Solo Dev"),
    coverImage: baseCover("photo-1484480974693-6ca0a78fb36b"),
    readingTime: 5,
    views: 22_600,
    likes: 1_980,
    comments: 64,
    category: "productivity",
    tags: ["solo-dev", "rituals", "tools"],
    publishedAt: "2026-04-14",
    author: AUTHORS[1],
  },
  {
    id: "b9",
    slug: "modern-money-the-2026-stack",
    title: "Modern Money: The 2026 Personal Finance Stack",
    excerpt:
      "Index funds, crypto, side income — a sane stack for keeping money compounding without burning out.",
    content: longContent("Modern Money: The 2026 Personal Finance Stack"),
    coverImage: baseCover("photo-1611974789855-9c2a0a7236a3"),
    readingTime: 12,
    views: 67_300,
    likes: 4_990,
    comments: 158,
    category: "finance",
    tags: ["money", "investing", "personal-finance"],
    publishedAt: "2026-04-10",
    author: AUTHORS[4],
    premium: true,
  },
  {
    id: "b10",
    slug: "your-first-1000-true-readers",
    title: "Your First 1,000 True Readers",
    excerpt:
      "How real writers actually find a real audience — without algorithm-chasing or selling out the work.",
    content: longContent("Your First 1,000 True Readers"),
    coverImage: baseCover("photo-1517836357463-d25dfeac3438"),
    readingTime: 8,
    views: 19_800,
    likes: 2_310,
    comments: 96,
    category: "marketing",
    tags: ["writing", "audience", "creators"],
    publishedAt: "2026-04-04",
    author: AUTHORS[5],
    editorPick: true,
  },
  {
    id: "b11",
    slug: "the-7-day-product-sprint",
    title: "The 7-Day Product Sprint We Run Every Quarter",
    excerpt:
      "A repeatable system to take a product from messy idea to shippable v1 in seven focused days.",
    content: longContent("The 7-Day Product Sprint"),
    coverImage: baseCover("photo-1454165804606-c3d57bc86b40"),
    readingTime: 10,
    views: 44_100,
    likes: 3_540,
    comments: 110,
    category: "business",
    tags: ["product", "sprint", "process"],
    publishedAt: "2026-03-30",
    author: AUTHORS[2],
  },
  {
    id: "b12",
    slug: "the-vibe-shift-in-tech-content",
    title: "The Vibe Shift in Tech Content",
    excerpt:
      "We're done with sanitized blog posts. The new wave of tech writing is sharper, weirder, and built for taste.",
    content: longContent("The Vibe Shift in Tech Content"),
    coverImage: baseCover("photo-1517511620798-cec17d428bc0"),
    readingTime: 6,
    views: 28_700,
    likes: 3_890,
    comments: 132,
    category: "memes-culture",
    tags: ["culture", "writing", "internet"],
    publishedAt: "2026-03-25",
    author: AUTHORS[3],
    trending: true,
  },
  {
    id: "b13",
    slug: "india-test-transition-2026",
    title: "India's Test Transition: What the Afghanistan Match Really Means",
    excerpt:
      "The one-off Test isn't about WTC points — it's about how India handles format switches, new leadership and a squad in flux.",
    content: longContent("India's Test Transition: What the Afghanistan Match Really Means"),
    coverImage: baseCover("photo-1531419140105-6e857e659f72"),
    readingTime: 7,
    views: 31_200,
    likes: 2_840,
    comments: 87,
    category: "sports",
    tags: ["cricket", "india", "test-cricket"],
    publishedAt: "2026-06-04",
    author: AUTHORS[2],
    featured: true,
    trending: true,
  },
  {
    id: "b14",
    slug: "t20-vs-test-mindset-for-creators",
    title: "T20 vs Test Mindset: Lessons Creators Can Steal From Cricket",
    excerpt:
      "Short-form hustle and long-form depth aren't opposites. The best players — and creators — know when to switch gears.",
    content: longContent("T20 vs Test Mindset: Lessons Creators Can Steal From Cricket"),
    coverImage: baseCover("photo-1624526267942-ab0ff8a3e972"),
    readingTime: 6,
    views: 18_400,
    likes: 1_920,
    comments: 54,
    category: "sports",
    tags: ["cricket", "creators", "mindset"],
    publishedAt: "2026-06-01",
    author: AUTHORS[5],
    editorPick: true,
  },
];

export function getBlogBySlug(slug: string) {
  return BLOGS.find((b) => b.slug === slug);
}

export function getTrending(limit = 6) {
  return BLOGS.filter((b) => b.trending).slice(0, limit);
}

export function getEditorPicks(limit = 4) {
  return BLOGS.filter((b) => b.editorPick).slice(0, limit);
}

export function getFeatured(limit = 3) {
  return BLOGS.filter((b) => b.featured).slice(0, limit);
}

export function getBlogsByCategory(slug: string) {
  return BLOGS.filter((b) => b.category === slug);
}

export function getLatestBlogs(limit = 8) {
  return [...BLOGS]
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, limit);
}

export function getRecommendedFor(currentSlug: string, limit = 3) {
  const current = getBlogBySlug(currentSlug);
  if (!current) return BLOGS.slice(0, limit);
  return BLOGS.filter(
    (b) => b.slug !== currentSlug && b.category === current.category
  ).slice(0, limit);
}

export function searchBlogs(q: string) {
  if (!q) return [] as Blog[];
  const term = q.toLowerCase();
  return BLOGS.filter(
    (b) =>
      b.title.toLowerCase().includes(term) ||
      b.excerpt.toLowerCase().includes(term) ||
      b.tags.some((t) => t.toLowerCase().includes(term)) ||
      b.author.name.toLowerCase().includes(term)
  );
}

export function getFeaturedAuthors(limit = 5) {
  return [...AUTHORS]
    .sort((a, b) => b.followers - a.followers)
    .slice(0, limit);
}
