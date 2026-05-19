import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/data/categories";
import { BLOGS } from "@/lib/data/blogs";
import { cache } from "@/lib/redis";

export async function GET() {
  const data = await cache.wrap("categories:all", 300, async () =>
    CATEGORIES.map((c) => ({
      ...c,
      blogCount: BLOGS.filter((b) => b.category === c.slug).length,
    }))
  );
  return NextResponse.json({ data });
}
