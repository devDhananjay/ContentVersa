import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { resolveBlogByRef } from "@/lib/data/resolve-blog-ref";
import { notifyBlogAuthorOnTip } from "@/lib/notifications/blog-engagement";

const BodySchema = z.object({
  amount: z.number().int().min(10).max(50_000),
  message: z.string().max(200).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await requireUser();
    const fromUserId = await requireUserId(session);
    const { amount, message } = BodySchema.parse(await req.json());

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const ref = await resolveBlogByRef(slug);
    if (!ref) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const blog = await prisma.blog.findUnique({
      where: { id: ref.id },
      select: { id: true, authorId: true },
    });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (blog.authorId === fromUserId) {
      return NextResponse.json({ error: "You cannot tip your own article" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.tip.create({
        data: {
          fromUserId,
          toUserId: blog.authorId,
          blogId: blog.id,
          amount,
          message: message ?? null,
        },
      }),
      prisma.wallet.upsert({
        where: { userId: blog.authorId },
        create: { userId: blog.authorId, balance: amount, currency: "INR" },
        update: { balance: { increment: amount } },
      }),
      prisma.revenue.create({
        data: {
          userId: blog.authorId,
          source: "TIP",
          amount,
          currency: "INR",
          reference: `tip:${blog.id}`,
        },
      }),
    ]);

    await notifyBlogAuthorOnTip(blog.id, fromUserId, amount);

    return NextResponse.json({ ok: true, amount });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in to send a tip" }, { status: 401 });
    }
    console.error("[tip POST]", err);
    return NextResponse.json({ error: "Failed to send tip" }, { status: 500 });
  }
}
