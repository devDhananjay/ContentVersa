import { NextResponse } from "next/server";
import { lookupPincode } from "@/lib/tools/pincode";

export async function GET(req: Request) {
  const pincode = new URL(req.url).searchParams.get("pincode")?.trim();
  if (!pincode) {
    return NextResponse.json({ error: "pincode query param required" }, { status: 400 });
  }

  try {
    const data = await lookupPincode(pincode);
    if (!data) {
      return NextResponse.json({ ok: false, error: "Pincode not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[tools/pincode]", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  }
}
