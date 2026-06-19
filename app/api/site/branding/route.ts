import { NextResponse } from "next/server";
import { getBrandingAssets } from "@/lib/data/site-branding";

export async function GET() {
  const assets = await getBrandingAssets();
  return NextResponse.json({ ok: true, assets });
}
