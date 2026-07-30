import { NextRequest, NextResponse } from "next/server";
import { isValidPnr, lookupPnr } from "@/lib/tools/railway";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const pnr = req.nextUrl.searchParams.get("pnr")?.trim() || "";
  if (!isValidPnr(pnr)) {
    return NextResponse.json(
      { ok: false, pnr, message: "PNR must be exactly 10 digits." },
      { status: 400 }
    );
  }
  const result = await lookupPnr(pnr);
  return NextResponse.json(result, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
