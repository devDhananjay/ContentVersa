import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { isMetaAppConfigured } from "@/lib/meta/config";
import { resolveInstagramForPage } from "@/lib/meta/graph";
import {
  clearMetaIntegration,
  getMetaIntegration,
  maskMetaIntegration,
  saveMetaIntegration,
} from "@/lib/meta/store";
import { getMetaPublishHistory } from "@/lib/meta/publish";

export async function GET() {
  try {
    await requireAdminApi();
    const integration = await getMetaIntegration();
    const history = await getMetaPublishHistory(15);

    return NextResponse.json({
      appConfigured: isMetaAppConfigured(),
      integration: maskMetaIntegration(integration),
      history,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load Meta status" }, { status: 500 });
  }
}

const ManualSchema = z.object({
  pageId: z.string().min(1),
  pageAccessToken: z.string().min(10),
  pageName: z.string().optional(),
  igUserId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    await requireAdminApi();
    const body = ManualSchema.parse(await req.json());

    let igUserId = body.igUserId?.trim() || null;
    let igUsername: string | null = null;

    if (!igUserId) {
      const resolved = await resolveInstagramForPage(body.pageId, body.pageAccessToken);
      igUserId = resolved.igUserId;
      igUsername = resolved.igUsername;
    }

    const integration = await saveMetaIntegration({
      pageId: body.pageId.trim(),
      pageName: body.pageName?.trim() || "Facebook Page",
      pageAccessToken: body.pageAccessToken.trim(),
      igUserId,
      igUsername,
      connectedAt: new Date().toISOString(),
      source: "manual",
    });

    return NextResponse.json({
      ok: true,
      integration: maskMetaIntegration(integration),
    });
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
    const message = err instanceof Error ? err.message : "Failed to save Meta config";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await requireAdminApi();
    await clearMetaIntegration();
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
