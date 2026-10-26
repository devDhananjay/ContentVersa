import type { TranslationLocale, TranslationStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  allowsSoftFallback,
  categoryNeedsHiApproval,
  I18N_POLICY,
} from "@/lib/i18n/policy";
import type { AppLocale } from "@/lib/i18n/config";
import { isToiNewsBriefing } from "@/lib/seo/crawl-policy";

export type LocalizedBlogFields = {
  title: string;
  excerpt: string | null;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  locale: AppLocale;
  /** True when HI was requested but we fell back to EN */
  usedFallback: boolean;
  translationStatus: TranslationStatus | null;
};

type BlogLike = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords?: string | null;
  category?: { slug: string } | null;
};

export async function getBlogTranslation(
  blogId: string,
  locale: TranslationLocale
) {
  if (!isDatabaseConfigured()) return null;
  return prisma.blogTranslation.findUnique({
    where: { blogId_locale: { blogId, locale } },
  });
}

export async function resolveLocalizedBlog(
  blog: BlogLike,
  locale: AppLocale
): Promise<LocalizedBlogFields> {
  if (locale === "en" || !isDatabaseConfigured()) {
    return {
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      locale: "en",
      usedFallback: false,
      translationStatus: null,
    };
  }

  const tr = await getBlogTranslation(blog.id, "hi");
  if (tr && tr.status === "PUBLISHED") {
    return {
      title: tr.title,
      excerpt: tr.excerpt,
      content: tr.content,
      metaTitle: tr.metaTitle,
      metaDescription: tr.metaDescription,
      locale: "hi",
      usedFallback: false,
      translationStatus: tr.status,
    };
  }

  const isNews = isToiNewsBriefing(blog.metaKeywords);
  const section = isNews
    ? "news"
    : categoryNeedsHiApproval(blog.category?.slug)
      ? "money"
      : "blogs";
  const soft = allowsSoftFallback(section);

  return {
    title: blog.title,
    excerpt: blog.excerpt,
    content: blog.content,
    metaTitle: blog.metaTitle,
    metaDescription: blog.metaDescription,
    locale: soft ? "en" : "hi",
    usedFallback: true,
    translationStatus: tr?.status ?? null,
  };
}

export async function upsertHiDraft(input: {
  blogId: string;
  title: string;
  excerpt?: string | null;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  source?: "AI" | "HUMAN" | "AI_EDITED";
  status?: TranslationStatus;
}) {
  return prisma.blogTranslation.upsert({
    where: { blogId_locale: { blogId: input.blogId, locale: "hi" } },
    create: {
      blogId: input.blogId,
      locale: "hi",
      title: input.title,
      excerpt: input.excerpt ?? null,
      content: input.content,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
      source: input.source ?? "AI",
      status: input.status ?? "DRAFT",
    },
    update: {
      title: input.title,
      excerpt: input.excerpt ?? null,
      content: input.content,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
      source: input.source ?? "AI",
      status: input.status ?? "DRAFT",
    },
  });
}

export async function setHiTranslationStatus(
  blogId: string,
  status: TranslationStatus
) {
  return prisma.blogTranslation.update({
    where: { blogId_locale: { blogId, locale: "hi" } },
    data: { status },
  });
}

export async function listHiTranslationQueue(opts?: {
  status?: TranslationStatus;
  limit?: number;
}) {
  if (!isDatabaseConfigured()) return [];
  return prisma.blogTranslation.findMany({
    where: {
      locale: "hi",
      status: opts?.status ?? { in: ["DRAFT", "READY"] },
    },
    include: {
      blog: {
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          category: { select: { slug: true, name: true } },
          publishedAt: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: opts?.limit ?? 100,
  });
}

export { I18N_POLICY, categoryNeedsHiApproval };
