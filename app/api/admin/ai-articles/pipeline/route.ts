import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { isDatabaseConfigured } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/data/categories";
import {
  researchPipelineTopics,
  runPublishingPipeline,
} from "@/lib/seo/pipeline";
import { dispatchBlogPublishedNotifications } from "@/lib/notifications/blog-published";

const ResearchSchema = z.object({
  action: z.literal("research"),
  category: z.string().min(1),
  count: z.number().int().min(3).max(10).optional(),
});

const TopicSchema = z.object({
  title: z.string().min(5),
  searchIntent: z.string().min(3),
  whyTrending: z.string().min(3),
  competition: z.enum(["low", "medium", "high"]),
  seoScore: z.number().min(0).max(100),
  keywords: z.array(z.string()).default([]),
  sources: z.array(z.string()).default([]),
});

const RunSchema = z.object({
  action: z.literal("run"),
  category: z.string().min(1),
  topic: TopicSchema,
  publish: z.boolean().optional().default(false),
  requireReviewPass: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  try {
    const admin = await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured on server" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const action = body?.action as string;

    if (action === "research") {
      const parsed = ResearchSchema.parse(body);
      if (!CATEGORIES.some((c) => c.slug === parsed.category)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      const { topics, source, warning } = await researchPipelineTopics(
        parsed.category,
        parsed.count ?? 6
      );
      return NextResponse.json({ ok: true, topics, source, warning });
    }

    if (action === "run") {
      const parsed = RunSchema.parse(body);
      if (!CATEGORIES.some((c) => c.slug === parsed.category)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }

      const authorId = await requireUserId(admin);
      const result = await runPublishingPipeline({
        authorId,
        categorySlug: parsed.category,
        topic: parsed.topic,
        publish: parsed.publish,
        requireReviewPass: parsed.requireReviewPass,
      });

      if (result.blog?.status === "PUBLISHED") {
        await dispatchBlogPublishedNotifications(result.blog.id).catch(() => {});
        revalidatePath("/");
        revalidatePath("/blogs");
        revalidatePath("/sitemap.xml");
        revalidatePath(`/blog/${result.blog.slug}`);
      }
      revalidatePath("/admin/blogs");
      revalidatePath("/dashboard/blogs");

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[admin ai pipeline]", err);
    return NextResponse.json({ error: "Pipeline failed" }, { status: 500 });
  }
}
