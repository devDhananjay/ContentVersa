import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { requireUserId, resolveUserId } from "@/lib/auth/resolve-user-id";
import { isDatabaseConfigured } from "@/lib/prisma";
import { getBlogEngagement, toggleBookmark } from "@/lib/data/blog-engagement";
import { resolveBlogByRef } from "@/lib/data/resolve-blog-ref";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: ref } = await params;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ bookmarked: false });
  }

  const blog = await resolveBlogByRef(ref);
  if (!blog) {
    return NextResponse.json({ bookmarked: false });
  }

  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ bookmarked: false });
    }
    const userId = await resolveUserId(session);
    if (!userId) {
      return NextResponse.json({ bookmarked: false });
    }
    const engagement = await getBlogEngagement(blog.id, userId);
    return NextResponse.json({ bookmarked: engagement?.bookmarked ?? false });
  } catch {
    return NextResponse.json({ bookmarked: false });
  }
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

    const { bookmarked } = await toggleBookmark(blog.id, userId);

    revalidatePath("/bookmarks");
    revalidatePath("/dashboard/bookmarks");
    revalidatePath(`/blog/${blog.slug}`);

    return NextResponse.json({ ok: true, bookmarked });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in to bookmark" }, { status: 401 });
    }
    console.error("[bookmark POST]", err);
    return NextResponse.json({ error: "Failed to save bookmark" }, { status: 500 });
  }
}
