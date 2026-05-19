import { NextResponse } from "next/server";
import { z } from "zod";
import { cache } from "@/lib/redis";
import { BLOGS, searchBlogs } from "@/lib/data/blogs";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { readingTime, slugify } from "@/lib/utils";

const CreateSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().optional(),
  content: z.string().min(20),
  coverImage: z.string().url().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).max(5).optional(),
  premium: z.boolean().optional(),
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

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = CreateSchema.parse(body);

    try {
      const slug = `${slugify(parsed.title)}-${Date.now().toString(36)}`;
      const blog = await prisma.blog.create({
        data: {
          title: parsed.title,
          slug,
          excerpt: parsed.excerpt || "",
          content: parsed.content,
          coverImage: parsed.coverImage,
          readingTime: readingTime(parsed.content),
          status: "PENDING",
          isPremium: parsed.premium || false,
          authorId: user.sub,
          submission: { create: { authorId: user.sub } },
        },
      });
      return NextResponse.json({ ok: true, blog });
    } catch {
      return NextResponse.json({
        ok: true,
        demo: true,
        message: "Submitted for review (demo mode — DB not configured).",
      });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}
