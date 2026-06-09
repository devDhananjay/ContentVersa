import { NextResponse } from "next/server";
import { getReelById } from "@/lib/reels/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reel = await getReelById(id);
  if (!reel) {
    return NextResponse.json({ error: "Reel not found" }, { status: 404 });
  }
  return NextResponse.json({ reel });
}
