import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { LocaleLink } from "@/components/i18n/locale-link";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";

/** Override root layout index+homepage-canonical so soft-404s don't look indexable. */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  return {
    title: t(dict, "errors.notFoundTitle"),
    robots: { index: false, follow: false },
    alternates: { canonical: undefined },
  };
}

export default async function NotFound() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <div className="container py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-neon-cyan">
        404
      </p>
      <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight mt-3">
        <span className="text-gradient">{t(dict, "errors.notFoundEyebrow")}</span>
      </h1>
      <p className="text-muted-foreground mt-4 max-w-md mx-auto">
        {t(dict, "errors.notFoundBody")}
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <LocaleLink href="/">
          <Button variant="gradient" size="lg">
            {t(dict, "errors.backHome")}
          </Button>
        </LocaleLink>
        <LocaleLink href="/blogs">
          <Button variant="outline" size="lg">
            {t(dict, "errors.browseArticles")}
          </Button>
        </LocaleLink>
      </div>
    </div>
  );
}
