import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getPollBySlug, castPollVote } from "@/lib/data/polls";

const VoteSchema = z.object({ optionId: z.string().min(1) });

function voterKey() {
  return `v_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const jar = await cookies();
  let key = jar.get("cv_poll_voter")?.value;
  if (!key) key = undefined;

  const poll = await getPollBySlug(slug, key);
  if (!poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }
  return NextResponse.json({ poll });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;
    const body = await req.json();
    const { optionId } = VoteSchema.parse(body);

    const jar = await cookies();
    let key = jar.get("cv_poll_voter")?.value;
    const isNew = !key;
    if (!key) key = voterKey();

    const poll = await castPollVote(slug, optionId, key);
    const res = NextResponse.json({ ok: true, poll });
    if (isNew) {
      res.cookies.set("cv_poll_voter", key, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "POLL_NOT_FOUND") {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }
    console.error("[poll vote]", err);
    return NextResponse.json({ error: "Vote failed" }, { status: 500 });
  }
}
