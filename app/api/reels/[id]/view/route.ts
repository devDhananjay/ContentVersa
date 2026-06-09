import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { incrementReelView } from "@/lib/reels/data";

const BodySchema = z.object({
  visitorKey: z.string().min(8).max(64).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();
    const body = BodySchema.parse(await req.json().catch(() => ({})));

    const userId = session ? await resolveUserId(session) : null;
    const visitorKey = body.visitorKey;

    if (!userId && !visitorKey) {
      return NextResponse.json({ error: "visitorKey required for guests" }, { status: 400 });
    }

    const isNew = await incrementReelView(id, {
      userId: userId ?? undefined,
      visitorKey,
    });
    return NextResponse.json({ ok: true, isNew });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not record view" }, { status: 500 });
  }
}
