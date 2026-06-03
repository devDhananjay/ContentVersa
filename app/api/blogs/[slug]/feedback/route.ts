import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { resolveBlogIdFromSlug } from "@/lib/data/resolve-blog-id";
import {
  getArticleFeedback,
  submitArticleFeedback,
} from "@/lib/data/article-feedback";

const Schema = z.object({ helpful: z.boolean() });

function voterKey() {
  return `f_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const blogId = await resolveBlogIdFromSlug(slug);
  if (!blogId) {
    return NextResponse.json({
      ok: true,
      helpful: 0,
      notHelpful: 0,
      userVote: null,
      demo: true,
    });
  }

  const jar = await cookies();
  const key = jar.get("cv_feedback_voter")?.value;
  const stats = await getArticleFeedback(blogId, key);
  return NextResponse.json({ ok: true, ...stats });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;
    const blogId = await resolveBlogIdFromSlug(slug);
    if (!blogId) {
      return NextResponse.json(
        { error: "Feedback is only available for published database blogs." },
        { status: 404 }
      );
    }

    const { helpful } = Schema.parse(await req.json());

    const session = await getCurrentUser();
    const userId = session ? await resolveUserId(session) : null;

    const jar = await cookies();
    let key = jar.get("cv_feedback_voter")?.value;
    const isNew = !key;
    if (!key) key = voterKey();

    const stats = await submitArticleFeedback({
      blogId,
      helpful,
      voterKey: key,
      userId,
    });

    const res = NextResponse.json({ ok: true, ...stats });
    if (isNew) {
      res.cookies.set("cv_feedback_voter", key, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
    }
    console.error("[article feedback]", err);
    return NextResponse.json({ error: "Feedback failed" }, { status: 500 });
  }
}
