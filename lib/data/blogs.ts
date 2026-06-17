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

export const BLOGS: Blog[] = [];

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
