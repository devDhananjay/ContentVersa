import { NextResponse } from "next/server";
import { getSiteVisitorCount } from "@/lib/site-visitors";

export async function GET() {
  try {
    const count = await getSiteVisitorCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
