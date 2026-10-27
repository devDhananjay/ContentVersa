import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import { LocaleLink } from "@/components/i18n/locale-link";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardDataCached } from "@/lib/data/dashboard-data";
import { buildMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t, tf } from "@/lib/i18n/get-dictionary";
import { withLocalePrefix } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  return buildMetadata({
    title: `${t(dict, "hubs.bookmarksTitle")} | ContentVerse India`,
    description: t(dict, "hubs.bookmarksEmpty"),
    path: withLocalePrefix("/bookmarks", locale),
    noIndex: true,
  });
}

export default async function BookmarksPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/bookmarks");

  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const data = await getDashboardDataCached(session);
  const saved = data?.bookmarks ?? [];
  const savedLabel =
    saved.length === 1
      ? t(dict, "hubs.bookmarksSavedOne")
      : tf(dict, "hubs.bookmarksSaved", { n: saved.length });

  return (
    <div className="container py-12 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center text-white">
          <Bookmark className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            {t(dict, "hubs.bookmarksTitle")}
          </h1>
          <p className="text-muted-foreground">{savedLabel}</p>
        </div>
      </div>

      {saved.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map((b, i) => (
            <BlogCard key={b.id} blog={b} index={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
          <p>{t(dict, "hubs.bookmarksEmpty")}</p>
          <LocaleLink href="/blogs" className="mt-4 inline-block">
            <Button variant="gradient">{t(dict, "hubs.bookmarksCta")}</Button>
          </LocaleLink>
        </div>
      )}
    </div>
  );
}
