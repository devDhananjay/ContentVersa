import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { publishToMeta } from "@/lib/meta/publish";

const BodySchema = z.object({
  contentType: z.enum(["blog", "reel"]),
  contentId: z.string().min(1),
  platforms: z.array(z.enum(["facebook", "instagram"])).min(1),
  customMessage: z.string().max(2200).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireAdminApi();
    const userId = await requireUserId(user);
    const body = BodySchema.parse(await req.json());

    const results = await publishToMeta({
      contentType: body.contentType,
      contentId: body.contentId,
      platforms: body.platforms,
      customMessage: body.customMessage,
      publishedBy: userId,
    });

    const allFailed = results.every((r) => !r.success);
    return NextResponse.json(
      { ok: !allFailed, results },
      { status: allFailed ? 502 : 200 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Publish failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
