import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import {
  getSitePage,
  updateSitePage,
  SITE_PAGE_SLUGS,
  type SitePageSlug,
} from "@/lib/data/site-pages";

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(2000).optional(),
  badge: z.string().max(80).optional(),
  sections: z.array(z.record(z.unknown())).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await getSitePage(slug);
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
  return NextResponse.json({ page });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!(SITE_PAGE_SLUGS as readonly string[]).includes(slug)) {
      return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    }

    const session = await requireUser();
    const userId = await resolveUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = UpdateSchema.parse(await req.json());
    const row = await updateSitePage(slug as SitePageSlug, body);
    if (!row) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const page = await getSitePage(slug);
    return NextResponse.json({ ok: true, page });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[site page PUT]", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
