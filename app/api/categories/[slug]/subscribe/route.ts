import { NextResponse } from "next/server";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ subscribed: false, signedIn: false, demo: true });
  }

  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ subscribed: false, signedIn: false });
  }

  const userId = await requireUserId(session).catch(() => null);
  if (!userId) {
    return NextResponse.json({ subscribed: false, signedIn: true });
  }

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const sub = await prisma.categorySubscription.findUnique({
    where: { userId_categoryId: { userId, categoryId: category.id } },
  });

  return NextResponse.json({
    subscribed: Boolean(sub),
    signedIn: true,
    category: category.name,
  });
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const { slug } = await ctx.params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: true, demo: true });
    }

    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await prisma.categorySubscription.upsert({
      where: {
        userId_categoryId: { userId, categoryId: category.id },
      },
      create: { userId, categoryId: category.id },
      update: {},
    });

    return NextResponse.json({ ok: true, subscribed: true, category: category.name });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const { slug } = await ctx.params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: true });
    }

    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await prisma.categorySubscription.deleteMany({
      where: { userId, categoryId: category.id },
    });

    return NextResponse.json({ ok: true, subscribed: false });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
