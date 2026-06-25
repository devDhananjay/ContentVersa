import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import {
  getBrandingAssets,
  setBrandingAsset,
  clearBrandingAsset,
  type BrandingKey,
} from "@/lib/data/site-branding";
import { isValidGoogleFaviconUrl } from "@/lib/branding/favicon";

const PostSchema = z.object({
  type: z.enum(["logo", "favicon", "loader"]),
  url: z.string().min(1).max(2000),
});

const DeleteSchema = z.object({
  type: z.enum(["logo", "favicon", "loader"]),
});

export async function GET() {
  try {
    await requireAdminApi();
    const assets = await getBrandingAssets();
    return NextResponse.json({ ok: true, assets });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load branding" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminApi();
    const body = PostSchema.parse(await req.json());
    const url = body.url.trim();
    if (!url.startsWith("/") && !url.startsWith("http://") && !url.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid asset URL" }, { status: 400 });
    }

    if (body.type === "favicon" && !isValidGoogleFaviconUrl(url)) {
      return NextResponse.json(
        {
          error:
            "Favicon must be a square PNG, ICO, WebP or SVG (not JPG). Use Admin → Branding or upload /favicon-48x48.png.",
        },
        { status: 400 }
      );
    }

    const asset = await setBrandingAsset(body.type as BrandingKey, url);
    return NextResponse.json({ ok: true, type: body.type, asset });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[branding] save failed", err);
    return NextResponse.json({ error: "Failed to save branding" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdminApi();
    const body = DeleteSchema.parse(await req.json());
    const asset = await clearBrandingAsset(body.type as BrandingKey);
    return NextResponse.json({ ok: true, type: body.type, asset });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[branding] remove failed", err);
    return NextResponse.json({ error: "Failed to remove branding" }, { status: 500 });
  }
}
