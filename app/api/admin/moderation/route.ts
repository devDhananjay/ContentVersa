import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";

const Schema = z.object({
  blogId: z.string(),
  decision: z.enum(["APPROVED", "REJECTED", "REQUEST_CHANGES"]),
  feedback: z.string().optional(),
});

export async function GET() {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    return NextResponse.json({ data: [], message: "Queue (demo)" });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { blogId, decision, feedback } = Schema.parse(body);
    return NextResponse.json({
      ok: true,
      review: { blogId, decision, feedback, reviewerId: user.sub },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
