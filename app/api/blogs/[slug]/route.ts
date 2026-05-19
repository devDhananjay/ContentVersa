import { NextResponse } from "next/server";
import { getBlogBySlug } from "@/lib/data/blogs";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const blog = getBlogBySlug(slug);
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: blog });
}
