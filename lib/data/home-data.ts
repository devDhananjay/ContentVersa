import type { Author, Blog } from "@/lib/data/blogs";
import type { CategoryDef } from "@/lib/data/categories";
import {
  getTrendingHybrid,
  getLatestHybrid,
  getEditorPicksHybrid,
  getFeaturedHybrid,
  getCategoriesWithCountsHybrid,
  getFeaturedCreatorsHybrid,
  getPlatformStatsHybrid,
  getPublishedBlogsHybrid,
} from "@/lib/data/blog-db";

export type CategoryWithCount = CategoryDef & { blogCount: number };

export type CommunityPost = {
  author: Author;
  content: string;
  likes: number;
  comments: number;
  reposts: number;
  time: string;
  tag?: string;
};

export type WeeklyTopic = {
  tag: string;
  count: string;
  color: string;
};

const TOPIC_COLORS = [
  "from-violet-500 to-fuchsia-500",
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-blue-500",
  "from-purple-500 to-pink-500",
];

function formatPostCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K posts`;
  return `${n} ${n === 1 ? "post" : "posts"}`;
}

function buildWeeklyTopics(blogs: Blog[]): WeeklyTopic[] {
  const counts = new Map<string, number>();
  for (const b of blogs) {
    counts.set(b.category, (counts.get(b.category) || 0) + 1);
    for (const t of b.tags) {
      counts.set(t, (counts.get(t) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count], i) => ({
      tag,
      count: formatPostCount(count),
      color: TOPIC_COLORS[i % TOPIC_COLORS.length],
    }));
}

function buildCommunityPosts(blogs: Blog[]): CommunityPost[] {
  return blogs.slice(0, 4).map((b) => ({
    author: b.author,
    content: b.excerpt,
    likes: b.likes,
    comments: b.comments,
    reposts: Math.max(1, Math.floor(b.likes / 15)),
    time: new Date(b.publishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    tag: b.tags[0] || b.category,
  }));
}

export type HomePageData = {
  trending: Blog[];
  latest: Blog[];
  editorPicks: Blog[];
  featured: Blog[];
  aiRecommended: Blog[];
  categories: CategoryWithCount[];
  creators: Author[];
  weeklyTopics: WeeklyTopic[];
  communityPosts: CommunityPost[];
  stats: { creators: string; readers: string; paid: string };
};

export async function getHomePageData(): Promise<HomePageData> {
  const [
    trending,
    latest,
    editorPicks,
    featured,
    categories,
    creators,
    stats,
    allPublished,
  ] = await Promise.all([
    getTrendingHybrid(5),
    getLatestHybrid(8),
    getEditorPicksHybrid(4),
    getFeaturedHybrid(3),
    getCategoriesWithCountsHybrid(),
    getFeaturedCreatorsHybrid(6),
    getPlatformStatsHybrid(),
    getPublishedBlogsHybrid(),
  ]);

  const aiRecommended = [
    ...editorPicks.slice(0, 2),
    ...latest.filter((b) => !editorPicks.some((p) => p.id === b.id)).slice(0, 2),
  ].slice(0, 4);

  const weeklyTopics = buildWeeklyTopics(allPublished);
  const communityPosts = buildCommunityPosts(
    [...allPublished].sort((a, b) => b.likes - a.likes)
  );

  return {
    trending,
    latest,
    editorPicks,
    featured,
    aiRecommended,
    categories,
    creators,
    weeklyTopics:
      weeklyTopics.length > 0
        ? weeklyTopics
        : buildWeeklyTopics(
            (await import("@/lib/data/blogs")).BLOGS
          ),
    communityPosts:
      communityPosts.length > 0
        ? communityPosts
        : buildCommunityPosts((await import("@/lib/data/blogs")).BLOGS),
    stats,
  };
}
