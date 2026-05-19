import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const ReactionSchema = z.object({
  type: z.enum(["LIKE", "LOVE", "FIRE", "CLAP", "INSIGHTFUL"]),
});

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const user = await requireUser();
    const { slug } = await ctx.params;
    const body = await req.json();
    const { type } = ReactionSchema.parse(body);
    // In a real implementation: write to prisma.reaction.upsert(...)
    return NextResponse.json({ ok: true, slug, type, userId: user.sub });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
