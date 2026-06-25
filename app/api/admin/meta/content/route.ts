import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getMetaPublishableContent } from "@/lib/meta/publish";

export async function GET(req: Request) {
  try {
    await requireAdminApi();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") === "reel" ? "reel" : "blog";
    const q = searchParams.get("q") ?? "";

    const items = await getMetaPublishableContent(type, q);
    return NextResponse.json({ type, items });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}
