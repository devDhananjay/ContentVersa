import { NextResponse } from "next/server";
import { getBrandingAssets } from "@/lib/data/site-branding";
import { resolveSiteLogo } from "@/lib/branding/logo";

export async function GET() {
  const assets = await getBrandingAssets();
  return NextResponse.json({
    ok: true,
    assets,
    logoUrl: resolveSiteLogo(assets.logo.current),
  });
}
