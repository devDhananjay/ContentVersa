import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import {
  AI_AUTO_GEN_ALWAYS_ON,
  getAiAutoGenSettings,
  setAiAutoGenCategories,
  setAiAutoGenEnabled,
} from "@/lib/ai/auto-gen-toggle";
import { CATEGORIES } from "@/lib/data/categories";

export async function GET() {
  try {
    await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const settings = await getAiAutoGenSettings();
    return NextResponse.json({
      enabled: settings.enabled,
      categorySlugs: settings.categorySlugs,
      activeCategorySlugs: settings.activeCategorySlugs,
      alwaysOnCategories: [...AI_AUTO_GEN_ALWAYS_ON],
      categories: CATEGORIES.map((c) => ({
        slug: c.slug,
        name: c.name,
        alwaysOn: AI_AUTO_GEN_ALWAYS_ON.includes(c.slug as (typeof AI_AUTO_GEN_ALWAYS_ON)[number]),
      })),
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

const PostSchema = z.object({
  enabled: z.boolean().optional(),
  categorySlugs: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const body = PostSchema.parse(await req.json());

    if (body.enabled !== undefined) {
      await setAiAutoGenEnabled(body.enabled);
    }
    if (body.categorySlugs !== undefined) {
      await setAiAutoGenCategories(body.categorySlugs);
    }

    const settings = await getAiAutoGenSettings();
    return NextResponse.json({
      ok: true,
      enabled: settings.enabled,
      categorySlugs: settings.categorySlugs,
      activeCategorySlugs: settings.activeCategorySlugs,
    });
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
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
