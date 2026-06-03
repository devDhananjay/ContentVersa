import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { getBlogBySlugHybrid } from "@/lib/data/blog-db";
import { getPersonalizedRecommendations } from "@/lib/data/reading-history";

/** GET /api/blogs/:slug/recommendations — "Blogs you may like" */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const blog = await getBlogBySlugHybrid(slug);
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  const session = await getCurrentUser();
  const userId = session ? await resolveUserId(session) : null;
  const jar = await cookies();
  const visitorKey = jar.get("cv_reader")?.value ?? null;

  const blogs = await getPersonalizedRecommendations(slug, 6, {
    userId,
    visitorKey,
  });

  return NextResponse.json({
    ok: true,
    slug,
    blogs: blogs.map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt,
      coverImage: b.coverImage,
      category: b.category,
      readingTime: b.readingTime,
      author: { name: b.author.name, username: b.author.username },
    })),
  });
}
