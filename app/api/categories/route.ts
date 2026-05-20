import { NextResponse } from "next/server";
import { getCategoriesWithCountsHybrid } from "@/lib/data/blog-db";
import { cache } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await cache.wrap("categories:all", 300, async () =>
    getCategoriesWithCountsHybrid()
  );
  return NextResponse.json({ data });
}
