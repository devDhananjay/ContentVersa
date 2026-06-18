import type { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { mapDbBlogToBlog } from "@/lib/data/blog-db";

const blogInclude = {
  author: { include: { profile: true } },
  category: true,
  tags: { include: { tag: true } },
  submission: {
    include: {
      reviews: {
        include: {
          reviewer: { select: { id: true, name: true, username: true, email: true } },
        },
        orderBy: { createdAt: "desc" as const },
        take: 5,
      },
    },
  },
} as const;

export type AdminOverviewData = {
  pendingCount: number;
  publishedCount: number;
  userCount: number;
  draftCount: number;
  rejectedCount: number;
  pendingBlogs: ReturnType<typeof mapDbBlogToBlog>[];
  recentPublished: ReturnType<typeof mapDbBlogToBlog>[];
};

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  username: string;
  image: string | null;
  role: string;
  banned: boolean;
  warnings: number;
  createdAt: Date;
  blogCount: number;
  followerCount: number;
  isVerified: boolean;
  /** Browser push allowed — at least one FCM token saved */
  pushEnabled: boolean;
  pushDeviceCount: number;
};

export type AdminBlogRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  status: BlogStatus;
  views: number;
  likesCount: number;
  commentsCount: number;
  readingTime: number;
  createdAt: Date;
  publishedAt: Date | null;
  author: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string;
  };
  category: string | null;
};

export type AdminBlogDetail = AdminBlogRow & {
  content: string;
  isPremium: boolean;
  rejectionNote: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: Date;
  tags: string[];
  submission: {
    decision: string;
    feedback: string | null;
    reviewedAt: Date | null;
    createdAt: Date;
    reviews: {
      decision: string;
      note: string | null;
      createdAt: Date;
      reviewer: { name: string | null; username: string; email: string };
    }[];
  } | null;
};

export type AdminUserDetail = AdminUserRow & {
  bio: string | null;
  headline: string | null;
  followingCount: number;
  totalViews: number;
  totalLikes: number;
  hasPassword: boolean;
  blogs: AdminBlogRow[];
};

type BlogForRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  status: BlogStatus;
  views: number;
  likesCount: number;
  commentsCount: number;
  readingTime: number;
  createdAt: Date;
  publishedAt: Date | null;
  author: { id: string; email: string; name: string | null; username: string; image: string | null };
  category: { name: string; slug: string } | null;
};

function mapBlogRow(blog: BlogForRow): AdminBlogRow {
  return {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt || "",
    coverImage: blog.coverImage,
    status: blog.status,
    views: blog.views,
    likesCount: blog.likesCount,
    commentsCount: blog.commentsCount,
    readingTime: blog.readingTime,
    createdAt: blog.createdAt,
    publishedAt: blog.publishedAt,
    author: {
      id: blog.author.id,
      name: blog.author.name || blog.author.username,
      username: blog.author.username,
      email: blog.author.email,
      avatar:
        blog.author.image ||
        `https://api.dicebear.com/8.x/notionists/svg?seed=${encodeURIComponent(blog.author.username)}`,
    },
    category: blog.category?.name ?? null,
  };
}

export async function getAdminOverview(): Promise<AdminOverviewData | null> {
  if (!isDatabaseConfigured()) return null;

  const [pendingCount, publishedCount, userCount, draftCount, rejectedCount, pendingRows, publishedRows] =
    await Promise.all([
      prisma.blog.count({ where: { status: "PENDING" } }),
      prisma.blog.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count(),
      prisma.blog.count({ where: { status: "DRAFT" } }),
      prisma.blog.count({ where: { status: "REJECTED" } }),
      prisma.blog.findMany({
        where: { status: "PENDING" },
        include: blogInclude,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.blog.findMany({
        where: { status: "PUBLISHED" },
        include: blogInclude,
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),
    ]);

  return {
    pendingCount,
    publishedCount,
    userCount,
    draftCount,
    rejectedCount,
    pendingBlogs: pendingRows.map((b) => mapDbBlogToBlog(b)),
    recentPublished: publishedRows.map((b) => mapDbBlogToBlog(b)),
  };
}

export async function getAdminPendingCount(): Promise<number> {
  if (!isDatabaseConfigured()) return 0;
  return prisma.blog.count({ where: { status: "PENDING" } });
}

export async function getAdminPendingReelCount(): Promise<number> {
  if (!isDatabaseConfigured()) return 0;
  return prisma.reel.count({ where: { status: "PENDING" } });
}

export type AdminReelQueueItem = {
  id: string;
  caption: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediaType: string;
  status: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
};

export async function getAdminReelModerationQueue(): Promise<{
  pending: AdminReelQueueItem[];
  rejected: AdminReelQueueItem[];
}> {
  if (!isDatabaseConfigured()) return { pending: [], rejected: [] };

  const authorSelect = {
    id: true,
    name: true,
    username: true,
    image: true,
  } as const;

  const [pending, rejected] = await Promise.all([
    prisma.reel.findMany({
      where: { status: "PENDING" },
      include: { author: { select: authorSelect } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reel.findMany({
      where: { status: "REJECTED" },
      include: { author: { select: authorSelect } },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  const mapRow = (r: (typeof pending)[number]): AdminReelQueueItem => ({
    id: r.id,
    caption: r.caption,
    mediaUrl: r.mediaUrl,
    thumbnailUrl: r.thumbnailUrl,
    mediaType: r.mediaType,
    status: r.status,
    createdAt: r.createdAt,
    author: {
      id: r.author.id,
      name: r.author.name || r.author.username,
      username: r.author.username,
      image: r.author.image,
    },
  });

  return {
    pending: pending.map(mapRow),
    rejected: rejected.map(mapRow),
  };
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  if (!isDatabaseConfigured()) return [];

  const users = await prisma.user.findMany({
    include: {
      profile: true,
      _count: { select: { blogs: true, followers: true, pushTokens: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    username: u.username,
    image: u.image,
    role: u.role,
    banned: u.banned,
    warnings: u.warnings,
    createdAt: u.createdAt,
    blogCount: u._count.blogs,
    followerCount: u._count.followers,
    isVerified: u.profile?.isVerified ?? false,
    pushEnabled: u._count.pushTokens > 0,
    pushDeviceCount: u._count.pushTokens,
  }));
}

/** Users who saved at least one browser push token (notification permission granted). */
export async function getPushEnabledUserCount(): Promise<number> {
  if (!isDatabaseConfigured()) return 0;
  const rows = await prisma.pushToken.groupBy({
    by: ["userId"],
  });
  return rows.length;
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  if (!isDatabaseConfigured()) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      blogs: {
        include: {
          author: true,
          category: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { blogs: true, followers: true, following: true, pushTokens: true },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    image: user.image,
    role: user.role,
    banned: user.banned,
    warnings: user.warnings,
    createdAt: user.createdAt,
    blogCount: user._count.blogs,
    followerCount: user._count.followers,
    followingCount: user._count.following,
    isVerified: user.profile?.isVerified ?? false,
    pushEnabled: user._count.pushTokens > 0,
    pushDeviceCount: user._count.pushTokens,
    bio: user.profile?.bio ?? null,
    headline: user.profile?.headline ?? null,
    totalViews: user.profile?.totalViews ?? 0,
    totalLikes: user.profile?.totalLikes ?? 0,
    hasPassword: !!user.password,
    blogs: user.blogs.map((b) =>
      mapBlogRow({
        id: b.id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt,
        coverImage: b.coverImage,
        status: b.status,
        views: b.views,
        likesCount: b.likesCount,
        commentsCount: b.commentsCount,
        readingTime: b.readingTime,
        createdAt: b.createdAt,
        publishedAt: b.publishedAt,
        author: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.image,
        },
        category: b.category,
      })
    ),
  };
}

export async function getAdminBlogs(status?: BlogStatus | "ALL"): Promise<AdminBlogRow[]> {
  if (!isDatabaseConfigured()) return [];

  const blogs = await prisma.blog.findMany({
    where: status && status !== "ALL" ? { status } : undefined,
    include: {
      author: { include: { profile: true } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return blogs.map((b) => mapBlogRow(b));
}

export async function getAdminBlogDetail(blogId: string): Promise<AdminBlogDetail | null> {
  if (!isDatabaseConfigured()) return null;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    include: blogInclude,
  });

  if (!blog) return null;

  const row = mapBlogRow(blog);
  const sub = blog.submission;

  return {
    ...row,
    content: blog.content,
    isPremium: blog.isPremium,
    rejectionNote: blog.rejectionNote,
    metaTitle: blog.metaTitle,
    metaDescription: blog.metaDescription,
    updatedAt: blog.updatedAt,
    tags: blog.tags.map((t) => t.tag.name),
    submission: sub
      ? {
          decision: sub.decision,
          feedback: sub.feedback,
          reviewedAt: sub.reviewedAt,
          createdAt: sub.createdAt,
          reviews: sub.reviews.map((r) => ({
            decision: r.decision,
            note: r.note,
            createdAt: r.createdAt,
            reviewer: {
              name: r.reviewer.name,
              username: r.reviewer.username,
              email: r.reviewer.email,
            },
          })),
        }
      : null,
  };
}

export async function getAdminBlogsByStatus() {
  if (!isDatabaseConfigured()) {
    return { pending: [], published: [], rejected: [], draft: [], archived: [] };
  }

  const [pending, published, rejected, draft, archived] = await Promise.all([
    getAdminBlogs("PENDING"),
    getAdminBlogs("PUBLISHED"),
    getAdminBlogs("REJECTED"),
    getAdminBlogs("DRAFT"),
    getAdminBlogs("ARCHIVED"),
  ]);

  return { pending, published, rejected, draft, archived };
}
