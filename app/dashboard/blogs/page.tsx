import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardDataCached } from "@/lib/data/dashboard-data";
import { MyBlogsClient } from "@/components/dashboard/my-blogs-client";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";

export default async function MyBlogs() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/dashboard/blogs");

  const data = await getDashboardDataCached(session);
  const rows = data?.allBlogs ?? [];

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            {t(dict, "dashboard.myBlogs")}
          </h1>
          <p className="text-muted-foreground mt-1">{t(dict, "dashPages.blogsSub")}</p>
        </div>
        <Link href="/dashboard/create">
          <Button variant="gradient">{t(dict, "dashPages.newBlog")}</Button>
        </Link>
      </div>

      <MyBlogsClient initialRows={rows} />
    </div>
  );
}
