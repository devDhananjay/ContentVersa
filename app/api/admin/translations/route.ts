import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import {
  listHiTranslationQueue,
  setHiTranslationStatus,
} from "@/lib/i18n/blog-translations";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  try {
    await requireAdminApi();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as
      | "DRAFT"
      | "READY"
      | "PUBLISHED"
      | null;
    const rows = await listHiTranslationQueue({
      status: status || undefined,
      limit: 150,
    });
    return NextResponse.json({ data: rows });
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

const PatchSchema = z.object({
  blogId: z.string().min(1),
  status: z.enum(["DRAFT", "READY", "PUBLISHED"]),
});

export async function PATCH(req: Request) {
  try {
    await requireAdminApi();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    const body = PatchSchema.parse(await req.json());
    const updated = await setHiTranslationStatus(body.blogId, body.status);
    const blog = await prisma.blog.findUnique({
      where: { id: body.blogId },
      select: { slug: true },
    });
    if (blog?.slug) {
      revalidatePath(`/blog/${blog.slug}`);
      revalidatePath(`/hi/blog/${blog.slug}`);
    }
    revalidatePath("/admin/translations");
    return NextResponse.json({ ok: true, translation: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[admin translations PATCH]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
