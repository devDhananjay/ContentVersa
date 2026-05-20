import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { requireUserId, resolveUserId } from "@/lib/auth/resolve-user-id";
import { isDatabaseConfigured } from "@/lib/prisma";
import {
  getBlogEngagement,
  toggleReaction,
  REACTION_TYPES,
} from "@/lib/data/blog-engagement";
import { resolveBlogByRef } from "@/lib/data/resolve-blog-ref";
import type { ReactionType } from "@prisma/client";

const PostSchema = z.object({
  type: z.enum(["LIKE", "LOVE", "FIRE", "CLAP", "INSIGHTFUL"]),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: ref } = await params;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const blog = await resolveBlogByRef(ref);
  if (!blog) {
    return NextResponse.json({
      totalReactions: 0,
      counts: { LIKE: 0, LOVE: 0, FIRE: 0, CLAP: 0, INSIGHTFUL: 0 },
      userReaction: null,
      bookmarked: false,
    });
  }

  const session = await getCurrentUser();
  const userId = session ? await resolveUserId(session) : null;
  const engagement = await getBlogEngagement(blog.id, userId);
  return NextResponse.json(engagement);
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
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
    const body = await req.json();
    const { type } = PostSchema.parse(body);

    if (!REACTION_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    const engagement = await toggleReaction(blog.id, userId, type as ReactionType);

    revalidatePath(`/blog/${blog.slug}`);
    revalidatePath("/dashboard");

    return NextResponse.json({ ok: true, ...engagement });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in to react" }, { status: 401 });
    }
    console.error("[reactions POST]", err);
    return NextResponse.json({ error: "Failed to save reaction" }, { status: 500 });
  }
}
