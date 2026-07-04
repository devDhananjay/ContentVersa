import { NextResponse } from "next/server";
import { z } from "zod";
import { BlogStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { readingTime, slugify } from "@/lib/utils";
import { normalizeCoverImageUrl } from "@/lib/server/upload-cover";

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

const UpdateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  coverImage: coverImageSchema,
  category: z.string().optional(),
  tags: z.array(z.string()).max(5).optional(),
  premium: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED", "REJECTED", "ARCHIVED"]).optional(),
  seriesSlug: z
    .string()
    .optional()
    .transform((v) => {
      const s = v?.trim().toLowerCase().replace(/\s+/g, "-");
      return s || undefined;
    }),
  seriesPart: z.coerce.number().int().min(1).max(99).optional().nullable(),
});

async function connectTags(blogId: string, tagSlugs: string[]) {
  await prisma.blogTag.deleteMany({ where: { blogId } });
  for (const raw of tagSlugs) {
    const slug = slugify(raw);
    if (!slug) continue;
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { slug, name: raw.replace(/-/g, " ") },
      update: {},
    });
    await prisma.blogTag.create({
      data: { blogId, tagId: tag.id },
    });
  }
}

/** GET any blog for admin edit form. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    const { id } = await ctx.params;
    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    return NextResponse.json({
      data: {
        id: blog.id,
        slug: blog.slug,
        title: blog.title,
        excerpt: blog.excerpt || "",
        content: blog.content,
        coverImage: blog.coverImage || "",
        category: blog.category?.slug || "",
        tags: blog.tags.map((t) => t.tag.slug),
        premium: blog.isPremium,
        metaTitle: blog.metaTitle || "",
        metaDescription: blog.metaDescription || "",
        status: blog.status,
        seriesSlug: blog.seriesSlug || "",
        seriesPart: blog.seriesPart,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[admin blogs GET]", err);
    return NextResponse.json({ error: "Failed to load blog" }, { status: 500 });
  }
}

/** PATCH any blog (including published) — admin content edit in place. */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { id } = await ctx.params;
    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const parsed = UpdateSchema.parse(await req.json());
    const status = (parsed.status ?? existing.status) as BlogStatus;

    let categoryId: string | null | undefined = undefined;
    if (parsed.category !== undefined) {
      if (parsed.category) {
        const cat = await prisma.category.findUnique({
          where: { slug: parsed.category },
          select: { id: true },
        });
        categoryId = cat?.id ?? null;
      } else {
        categoryId = null;
      }
    }

    const coverImage = await normalizeCoverImageUrl(parsed.coverImage);
    const becomingPublished =
      status === BlogStatus.PUBLISHED && existing.status !== BlogStatus.PUBLISHED;

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        title: parsed.title,
        excerpt: parsed.excerpt || "",
        content: parsed.content,
        coverImage,
        readingTime: readingTime(parsed.content),
        status,
        isPremium: parsed.premium ?? existing.isPremium,
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
        seriesSlug: parsed.seriesSlug ?? null,
        seriesPart: parsed.seriesSlug ? (parsed.seriesPart ?? 1) : null,
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(becomingPublished ? { publishedAt: existing.publishedAt ?? new Date() } : {}),
      },
    });

    if (parsed.tags) {
      await connectTags(blog.id, parsed.tags);
    }

    revalidatePath("/admin/blogs");
    revalidatePath(`/admin/blogs/${blog.id}`);
    revalidatePath("/dashboard/blogs");
    revalidatePath(`/blog/${blog.slug}`);
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      ok: true,
      blog: { id: blog.id, slug: blog.slug, status: blog.status },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.errors[0];
      return NextResponse.json(
        { error: first?.message || "Invalid input" },
        { status: 400 }
      );
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[admin blogs PATCH]", err);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}
