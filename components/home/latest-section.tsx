import { ArrowRight } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import { LocaleLink } from "@/components/i18n/locale-link";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import type { Blog } from "@/lib/data/blogs";

interface Props {
  blogs: Blog[];
}

export async function LatestSection({ blogs }: Props) {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <section
      className="container scroll-mt-[calc(var(--site-header-offset)+1rem)] py-12 md:py-20"
      id="home-latest"
    >
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="v2-eyebrow">{t(dict, "home.latestEyebrow")}</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-2">
            {t(dict, "home.latestTitle")}{" "}
            <span className="text-gradient">{t(dict, "home.latestTitleAccent")}</span>
          </h2>
        </div>
        <LocaleLink href="/blogs" className="hidden sm:block">
          <Button variant="outline" className="gap-2 rounded-full">
            {t(dict, "common.seeAll")} <ArrowRight className="h-4 w-4" />
          </Button>
        </LocaleLink>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {blogs.map((b, i) => (
          <BlogCard key={b.id} blog={b} index={i} />
        ))}
      </div>

      <div className="mt-6 sm:hidden">
        <LocaleLink href="/blogs">
          <Button variant="gradient" className="w-full gap-2">
            {t(dict, "common.seeAll")} <ArrowRight className="h-4 w-4" />
          </Button>
        </LocaleLink>
      </div>
    </section>
  );
}
