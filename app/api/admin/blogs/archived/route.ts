import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { BlogStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export async function DELETE() {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Never wipe discover-* shadow rows — Discover comments/reactions need them.
    const archived = await prisma.blog.findMany({
      where: {
        status: BlogStatus.ARCHIVED,
        slug: { not: { startsWith: "discover-" } },
      },
      select: { id: true, slug: true },
    });

    if (archived.length === 0) {
      return NextResponse.json({ ok: true, deleted: 0 });
    }

    const ids = archived.map((b) => b.id);

    await prisma.$transaction([
      prisma.poll.deleteMany({ where: { blogId: { in: ids } } }),
      prisma.blog.deleteMany({
        where: {
          status: BlogStatus.ARCHIVED,
          slug: { not: { startsWith: "discover-" } },
        },
      }),
    ]);

    revalidatePath("/admin/blogs");
    revalidatePath("/admin");
    revalidatePath("/blogs");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    for (const blog of archived) {
      revalidatePath(`/blog/${blog.slug}`);
    }

    return NextResponse.json({ ok: true, deleted: archived.length });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[admin blogs archived DELETE]", err);
    return NextResponse.json({ error: "Failed to delete archived blogs" }, { status: 500 });
  }
}
