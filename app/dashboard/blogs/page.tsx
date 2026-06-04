import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardDataCached } from "@/lib/data/dashboard-data";
import { MyBlogsClient } from "@/components/dashboard/my-blogs-client";

export default async function MyBlogs() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/dashboard/blogs");

  const data = await getDashboardDataCached(session);
  const rows = data?.allBlogs ?? [];

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            My Blogs
          </h1>
          <p className="text-muted-foreground mt-1">
            {rows.length} {rows.length === 1 ? "post" : "posts"} — only your content is shown here.
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button variant="gradient">New Blog</Button>
        </Link>
      </div>

      <MyBlogsClient initialRows={rows} />
    </div>
  );
}
