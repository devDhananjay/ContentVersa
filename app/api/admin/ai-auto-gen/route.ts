import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { isAiAutoGenEnabled, setAiAutoGenEnabled } from "@/lib/ai/auto-gen-toggle";

export async function GET() {
  try {
    await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const enabled = await isAiAutoGenEnabled();
    return NextResponse.json({ enabled });
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
    const body = await req.json();
    const enabled = body.enabled === true;
    await setAiAutoGenEnabled(enabled);
    return NextResponse.json({ ok: true, enabled });
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
