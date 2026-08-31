import { readdir } from "node:fs/promises";
import { NextResponse } from "next/server";
import { z } from "zod";
import { BlogStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUploadsDirectory } from "@/lib/storage/upload-dir";

const STOP = new Set(["india", "indian", "guide", "2024", "2025", "2026", "daily", "the", "and", "for"]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));
}

function score(file: string, slug: string, title: string): number {
  const fn = file.toLowerCase();
  let s = 0;
  for (const t of [...tokens(slug), ...tokens(title)]) {
    if (fn.includes(t)) s += t.length;
  }
  return s;
}

export async function GET(req: Request) {
  try {
    await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const limit = Number(new URL(req.url).searchParams.get("limit") ?? 80);

    const files = await readdir(getUploadsDirectory());
    const imageFiles = files.filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f));

    const blogs = await prisma.blog.findMany({
      where: { status: { in: [BlogStatus.PUBLISHED, BlogStatus.DRAFT] } },
      select: { id: true, slug: true, title: true, coverImage: true, status: true },
    });

    const used = new Set(
      blogs
        .map((b) => b.coverImage?.trim())
        .filter((u): u is string => !!u && u.includes("/uploads/"))
        .map((u) => u.split("/").pop()!)
    );

    const orphans = imageFiles.filter((f) => !used.has(f));

    const rows = orphans.slice(0, limit).map((file) => {
      const suggestions = blogs
        .filter((b) => !b.coverImage?.startsWith("/uploads/"))
        .map((b) => ({
          id: b.id,
          slug: b.slug,
          title: b.title,
          status: b.status,
          score: score(file, b.slug, b.title),
        }))
        .filter((s) => s.score >= 6)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      return {
        file,
        url: `/uploads/${file}`,
        suggestions,
      };
    });

    rows.sort((a, b) => (b.suggestions[0]?.score ?? 0) - (a.suggestions[0]?.score ?? 0));

    return NextResponse.json({
      totalOrphans: orphans.length,
      usedCount: used.size,
      diskCount: imageFiles.length,
      rows,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[admin/orphan-covers]", err);
    return NextResponse.json({ error: "Failed to list orphan covers" }, { status: 500 });
  }
}

const AssignSchema = z.object({
  blogId: z.string().min(1),
  filename: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const { blogId, filename } = AssignSchema.parse(await req.json());

    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const files = await readdir(getUploadsDirectory());
    if (!files.includes(filename)) {
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
    }

    await prisma.blog.update({
      where: { id: blogId },
      data: { coverImage: `/uploads/${filename}` },
    });

    return NextResponse.json({ ok: true, coverImage: `/uploads/${filename}` });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[admin/orphan-covers POST]", err);
    return NextResponse.json({ error: "Assign failed" }, { status: 500 });
  }
}
