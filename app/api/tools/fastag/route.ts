import { NextResponse } from "next/server";
import { lookupFastag } from "@/lib/tools/ulip";

export async function GET(req: Request) {
  const vehicle = new URL(req.url).searchParams.get("vehicle")?.trim();
  if (!vehicle) {
    return NextResponse.json({ error: "vehicle query param required" }, { status: 400 });
  }
  try {
    const result = await lookupFastag(vehicle);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[tools/fastag]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "FASTag lookup failed" }, { status: 502 });
  }
}
