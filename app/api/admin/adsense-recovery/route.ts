import { NextResponse } from "next/server";
import { BlogStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { thinPublishedWhere } from "@/lib/seo/thin-published";
import { setAiAutoGenEnabled, isAiAutoGenEnabled } from "@/lib/ai/auto-gen-toggle";

export async function GET() {
  try {
    await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ thinPublished: 0, autoGenEnabled: false });
    }
    const [thinPublished, autoGenEnabled] = await Promise.all([
      prisma.blog.count({ where: thinPublishedWhere }),
      isAiAutoGenEnabled(),
    ]);
    return NextResponse.json({ thinPublished, autoGenEnabled });
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

export async function POST(req: Request) {
  try {
    await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "DB not configured" }, { status: 503 });
    }
    const body = await req.json().catch(() => ({}));
    if (body.confirm !== true) {
      return NextResponse.json({ error: "Set confirm: true" }, { status: 400 });
    }

    const result = await prisma.blog.updateMany({
      where: thinPublishedWhere,
      data: { status: BlogStatus.ARCHIVED, adEligible: false },
    });
    await setAiAutoGenEnabled(false);

    return NextResponse.json({
      ok: true,
      archived: result.count,
      autoGenEnabled: false,
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
