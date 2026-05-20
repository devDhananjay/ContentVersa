import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { resolveBlogByRef } from "@/lib/data/resolve-blog-ref";
import {
  createComment,
  getCommentsForBlog,
} from "@/lib/data/comments";
import { isDatabaseConfigured } from "@/lib/prisma";
import { BLOGS } from "@/lib/data/blogs";
import { AUTHORS } from "@/lib/data/blogs";

const PostSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      data: [
        {
          id: "seed-1",
          content:
            "This is exactly the framing I needed. Sharing with my team.",
          createdAt: new Date().toISOString(),
          likes: 28,
          likedByMe: false,
          parentId: null,
          author: {
            id: "a1",
            name: AUTHORS[1]?.name || "Reader",
            username: AUTHORS[1]?.username || "reader",
            avatar: AUTHORS[1]?.avatar || "",
          },
          replies: [],
        },
      ],
      demo: true,
      slug,
    });
  }

  const blog = await resolveBlogByRef(slug);
  if (!blog) {
    const mock = BLOGS.find((b) => b.slug === slug);
    if (!mock) return NextResponse.json({ data: [], slug });
  }

  const session = await getCurrentUser();
  let viewerId: string | null = null;
  if (session) {
    try {
      viewerId = await requireUserId(session);
    } catch {
      viewerId = null;
    }
  }

  const blogId = blog?.id;
  if (!blogId) return NextResponse.json({ data: [], slug });

  const data = await getCommentsForBlog(blogId, viewerId);
  return NextResponse.json({ data, slug });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const { slug } = await ctx.params;
    const body = await req.json();
    const parsed = PostSchema.parse(body);

    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        ok: true,
        demo: true,
        comment: {
          id: `demo-${Date.now()}`,
          content: parsed.content,
          createdAt: new Date().toISOString(),
          likes: 0,
          likedByMe: false,
          parentId: parsed.parentId || null,
          author: {
            id: userId,
            name: session.name || session.username,
            username: session.username,
            avatar: session.image || "",
          },
          replies: [],
        },
      });
    }

    const blog = await resolveBlogByRef(slug);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const comment = await createComment({
      blogId: blog.id,
      userId,
      content: parsed.content,
      parentId: parsed.parentId,
    });

    return NextResponse.json({ ok: true, comment });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });
    }
    console.error("[comments POST]", err);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
