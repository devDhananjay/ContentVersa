import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cache } from "@/lib/redis";
import { BLOGS, searchBlogs } from "@/lib/data/blogs";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { readingTime, slugify } from "@/lib/utils";

const coverImageSchema = z
  .string()
  .optional()
  .transform((v) => {
    const s = v?.trim();
    if (!s) return undefined;
    return s;
  })
  .refine(
    (v) =>
      !v ||
      v.startsWith("/") ||
      v.startsWith("data:image/") ||
      /^https?:\/\//i.test(v),
    { message: "Cover must be an uploaded image, data URL, or http(s) link" }
  );

const CreateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  coverImage: coverImageSchema,
  category: z.string().optional(),
  tags: z.array(z.string()).max(5).optional(),
  premium: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING"]).optional().default("PENDING"),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "trending";
  const limit = Number(searchParams.get("limit") || 20);

  const key = `blogs:${q}:${category}:${sort}:${limit}`;
  const result = await cache.wrap(key, 60, async () => {
    let list = [...BLOGS];
    if (q) list = searchBlogs(q);
    if (category) list = list.filter((b) => b.category === category);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const all = [...list];

    switch (sort) {
      case "latest":
        list.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
        break;
      case "liked":
        list.sort((a, b) => b.likes - a.likes);
        break;
      case "viewed":
        list.sort((a, b) => b.views - a.views);
        break;
      case "editor":
        list = list.filter((b) => b.editorPick);
        break;
      case "most_read_today": {
        const today = todayStart.getTime();
        list = list.filter((b) => +new Date(b.publishedAt) >= today);
        list.sort((a, b) => b.views - a.views);
        if (list.length < 3) list = [...all].sort((a, b) => b.views - a.views);
        break;
      }
      case "trending_week": {
        list = list.filter((b) => +new Date(b.publishedAt) >= weekAgo);
        list.sort(
          (a, b) =>
            Number(!!b.trending) - Number(!!a.trending) ||
            b.views + b.likes - (a.views + a.likes)
        );
        if (list.length < 3) {
          list = [...all]
            .filter((b) => b.trending || +new Date(b.publishedAt) >= weekAgo)
            .sort((a, b) => b.views - a.views);
        }
        break;
      }
      default:
        list.sort(
          (a, b) =>
            Number(!!b.trending) - Number(!!a.trending) || b.views - a.views
        );
    }
    return list.slice(0, limit);
  });
  return NextResponse.json({ data: result, count: result.length });
}

async function connectTags(blogId: string, tagSlugs: string[]) {
  for (const raw of tagSlugs) {
    const slug = slugify(raw);
    if (!slug) continue;
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { slug, name: raw.replace(/-/g, " ") },
      update: {},
    });
    await prisma.blogTag.upsert({
      where: { blogId_tagId: { blogId, tagId: tag.id } },
      create: { blogId, tagId: tag.id },
      update: {},
    });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured. Set DATABASE_URL in .env." },
        { status: 503 }
      );
    }

    const authorId = await requireUserId(session);
    const body = await req.json();
    const parsed = CreateSchema.parse(body);

    if (parsed.status === "PENDING" && parsed.content.trim().length < 20) {
      return NextResponse.json(
        { error: "Write at least 20 characters before submitting for review." },
        { status: 400 }
      );
    }

    let categoryId: string | undefined;
    if (parsed.category) {
      const cat = await prisma.category.findUnique({
        where: { slug: parsed.category },
        select: { id: true },
      });
      categoryId = cat?.id;
    }

    const slug = `${slugify(parsed.title)}-${Date.now().toString(36)}`;

    const blog = await prisma.blog.create({
      data: {
        title: parsed.title,
        slug,
        excerpt: parsed.excerpt || "",
        content: parsed.content,
        coverImage: parsed.coverImage,
        readingTime: readingTime(parsed.content),
        status: parsed.status,
        isPremium: parsed.premium || false,
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
        authorId,
        categoryId,
        ...(parsed.status === "PENDING"
          ? {
              submission: {
                create: {
                  authorId,
                  decision: "PENDING",
                },
              },
            }
          : {}),
      },
    });

    if (parsed.tags?.length) {
      await connectTags(blog.id, parsed.tags);
    }

    revalidatePath("/dashboard/blogs");
    revalidatePath("/dashboard");
    revalidatePath("/admin/moderation");

    return NextResponse.json({ ok: true, blog: { id: blog.id, slug: blog.slug, status: blog.status } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.errors[0];
      const message = first
        ? `${first.path.length ? `${first.path.join(".")}: ` : ""}${first.message}`
        : "Invalid input";
      return NextResponse.json({ error: message, details: err.flatten() }, { status: 400 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "User account not found. Sign out and sign in again." }, { status: 400 });
    }
    console.error("[blogs POST]", err);
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}
