import { NextResponse } from "next/server";
import { searchBlogs } from "@/lib/data/blogs";
import { AUTHORS } from "@/lib/data/blogs";
import { CATEGORIES } from "@/lib/data/categories";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() || "";
  if (!q) return NextResponse.json({ blogs: [], authors: [], categories: [] });

  const blogs = searchBlogs(q).slice(0, 5);
  const authors = AUTHORS.filter(
    (a) => a.name.toLowerCase().includes(q) || a.username.toLowerCase().includes(q)
  ).slice(0, 5);
  const categories = CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(q)
  ).slice(0, 5);

  return NextResponse.json({ blogs, authors, categories });
}
