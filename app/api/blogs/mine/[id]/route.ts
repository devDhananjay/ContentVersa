import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
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
  /** PUBLISHED only allowed when the post is already live (in-place edit). */
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED"]).optional(),
  seriesSlug: z
    .string()
    .optional()
    .transform((v) => {
      const s = v?.trim().toLowerCase().replace(/\s+/g, "-");
      return s || undefined;
    }),
  seriesPart: z.coerce.number().int().min(1).max(99).optional().nullable(),
}).refine(
  (d) => d.seriesPart == null || Boolean(d.seriesSlug),
  { message: "Series part requires a series slug", path: ["seriesPart"] }
);

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

async function getOwnedBlog(id: string, authorId: string) {
  return prisma.blog.findFirst({
    where: { id, authorId },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const authorId = await requireUserId(session);
    const { id } = await ctx.params;
    const blog = await getOwnedBlog(id, authorId);
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
        seriesPart: blog.seriesPart ?? null,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[blogs mine GET]", err);
    return NextResponse.json({ error: "Failed to load blog" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const authorId = await requireUserId(session);
    const { id } = await ctx.params;
    const existing = await getOwnedBlog(id, authorId);
    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = UpdateSchema.parse(body);
    let status = parsed.status ?? existing.status;

    // Authors cannot self-publish; they may only keep PUBLISHED when already live.
    if (status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "You cannot publish directly. Submit for review instead." },
        { status: 400 }
      );
    }
    if (
      existing.status === "PUBLISHED" &&
      parsed.status === undefined
    ) {
      status = "PUBLISHED";
    }

    if (status === "PENDING" && parsed.content.trim().length < 20) {
      return NextResponse.json(
        { error: "Write at least 20 characters before submitting for review." },
        { status: 400 }
      );
    }

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

    const blog = await prisma.blog.update({
      where: { id: existing.id },
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
        ...(status === "PENDING" && existing.status === "DRAFT"
          ? {
              submission: {
                upsert: {
                  create: { authorId, decision: "PENDING" },
                  update: { decision: "PENDING", reviewedAt: null, feedback: null },
                },
              },
            }
          : {}),
      },
    });

    if (parsed.tags) {
      await connectTags(blog.id, parsed.tags);
    }

    revalidatePath("/dashboard/blogs");
    revalidatePath("/dashboard");
    revalidatePath(`/blog/${blog.slug}`);

    return NextResponse.json({
      ok: true,
      blog: { id: blog.id, slug: blog.slug, status: blog.status },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.errors[0];
      const message = first
        ? `${first.path.length ? `${first.path.join(".")}: ` : ""}${first.message}`
        : "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[blogs mine PATCH]", err);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const authorId = await requireUserId(session);
    const { id } = await ctx.params;
    const existing = await getOwnedBlog(id, authorId);
    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.poll.deleteMany({ where: { blogId: id } }),
      prisma.blog.delete({ where: { id } }),
    ]);

    revalidatePath("/dashboard/blogs");
    revalidatePath("/dashboard");
    revalidatePath("/blogs");
    revalidatePath("/");
    revalidatePath(`/blog/${existing.slug}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[blogs mine DELETE]", err);
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}
