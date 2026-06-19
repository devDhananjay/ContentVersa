import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { requireUserId, resolveUserId } from "@/lib/auth/resolve-user-id";
import { isDatabaseConfigured } from "@/lib/prisma";
import { resolveBlogByRef } from "@/lib/data/resolve-blog-ref";
import { getBlogRepostState, toggleBlogRepost } from "@/lib/data/blog-reposts";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: ref } = await params;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ repostCount: 0, reposted: false });
  }

  const blog = await resolveBlogByRef(ref);
  if (!blog) {
    return NextResponse.json({ repostCount: 0, reposted: false });
  }

  const session = await getCurrentUser();
  const userId = session ? await resolveUserId(session) : null;
  const state = await getBlogRepostState(blog.id, userId);
  return NextResponse.json(state);
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: ref } = await params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const blog = await resolveBlogByRef(ref);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const session = await requireUser();
    const userId = await requireUserId(session);
    const result = await toggleBlogRepost(blog.id, userId);

    revalidatePath("/");
    revalidatePath(`/blog/${blog.slug}`);

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in to repost" }, { status: 401 });
    }
    console.error("[repost POST]", err);
    return NextResponse.json({ error: "Failed to repost" }, { status: 500 });
  }
}
