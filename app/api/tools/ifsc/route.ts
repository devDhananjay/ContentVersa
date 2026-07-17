import { NextResponse } from "next/server";
import { lookupIfsc } from "@/lib/tools/ifsc";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code")?.trim();
  if (!code) {
    return NextResponse.json({ error: "code query param required" }, { status: 400 });
  }

  try {
    const data = await lookupIfsc(code);
    if (!data) {
      return NextResponse.json({ ok: false, error: "IFSC not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[tools/ifsc]", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  }
}
