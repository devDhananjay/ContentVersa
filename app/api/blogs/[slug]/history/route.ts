import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { resolveBlogIdFromSlug } from "@/lib/data/resolve-blog-id";
import {
  getBlogReadingForReader,
  getUserReadingStats,
  recordReadingProgress,
} from "@/lib/data/reading-history";
import { getBlogBySlugHybrid } from "@/lib/data/blog-db";
import { maybeExtendReadingStreak } from "@/lib/engagement/streak";

const BodySchema = z.object({
  seconds: z.number().int().min(0).max(120).optional(),
  progress: z.number().int().min(0).max(100).optional(),
});

function visitorKey() {
  return `r_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

async function readerContext() {
  const session = await getCurrentUser();
  const userId = session ? await resolveUserId(session) : null;
  const jar = await cookies();
  let key = jar.get("cv_reader")?.value;
  const isNew = !key;
  if (!key) key = visitorKey();
  return { userId, visitorKey: userId ? null : key, isNew };
}

/** GET — seconds read on this article + total for logged-in user */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;
    const blog = await getBlogBySlugHybrid(slug);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const { userId, visitorKey: vKey } = await readerContext();
    const blogId = await resolveBlogIdFromSlug(slug);

    let articleSeconds = 0;
    let progress = 0;
    if (blogId) {
      const row = await getBlogReadingForReader(blogId, {
        userId,
        visitorKey: vKey,
      });
      articleSeconds = row?.secondsRead ?? 0;
      progress = row?.progress ?? 0;
    }

    let totalReadingSeconds = 0;
    let articlesRead = 0;
    if (userId) {
      const stats = await getUserReadingStats(userId);
      totalReadingSeconds = stats.totalSeconds;
      articlesRead = stats.articlesRead;
    }

    return NextResponse.json({
      ok: true,
      slug,
      articleSeconds,
      progress,
      totalReadingSeconds,
      articlesRead,
    });
  } catch (err) {
    console.error("[reading history GET]", err);
    return NextResponse.json({ error: "Failed to load reading stats" }, { status: 500 });
  }
}

/** POST — record reading time heartbeat */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;
    const blog = await getBlogBySlugHybrid(slug);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const { userId, visitorKey: vKey, isNew } = await readerContext();

    let body: z.infer<typeof BodySchema> = {};
    try {
      const json = await req.json();
      body = BodySchema.parse(json);
    } catch {
      /* empty body ok for first ping */
    }

    const blogId = await resolveBlogIdFromSlug(slug);
    let row = null;
    if (blogId) {
      row = await recordReadingProgress({
        blogId,
        category: blog.category,
        tags: blog.tags,
        userId,
        visitorKey: vKey,
        seconds: body.seconds ?? 0,
        progress: body.progress,
      });
    }

    let totalReadingSeconds = 0;
    let streakDays = 0;
    let streakExtended = false;
    if (userId) {
      const stats = await getUserReadingStats(userId);
      totalReadingSeconds = stats.totalSeconds;
      const streak = await maybeExtendReadingStreak(userId);
      if (streak) {
        streakDays = streak.streakDays;
        streakExtended = streak.extended;
      }
    }

    const res = NextResponse.json({
      ok: true,
      articleSeconds: row?.secondsRead ?? 0,
      progress: row?.progress ?? body.progress ?? 0,
      totalReadingSeconds,
      streakDays,
      streakExtended,
    });

    if (isNew && !userId && vKey) {
      res.cookies.set("cv_reader", vKey, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }
    return res;
  } catch (err) {
    console.error("[reading history POST]", err);
    return NextResponse.json({ error: "Failed to record read" }, { status: 500 });
  }
}
