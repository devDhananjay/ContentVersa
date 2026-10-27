import Link from "next/link";
import {
  BookOpen,
  Shield,
  Scale,
  Cookie,
  FileText,
  Users,
  Sparkles,
} from "lucide-react";
import { StickyRailAd } from "@/components/ads/sticky-rail-ad";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { getRequestLocale } from "@/lib/i18n/locale-server";

const POLICY_LINKS = [
  {
    href: "/policy",
    labelKey: "footer.contentPolicy",
    detail: "What we publish and what we remove",
    icon: FileText,
  },
  {
    href: "/privacy",
    labelKey: "footer.privacy",
    detail: "DPDP Act & how we handle your data",
    icon: Shield,
  },
  {
    href: "/terms",
    labelKey: "footer.terms",
    detail: "Account rules and your rights",
    icon: Scale,
  },
  {
    href: "/cookies",
    labelKey: "footer.cookies",
    detail: "Essential, analytics & ad cookies",
    icon: Cookie,
  },
  {
    href: "/creator-program",
    labelKey: "footer.creatorProgram",
    detail: "Quality bar, tips & featuring",
    icon: Users,
  },
  {
    href: "/about",
    labelKey: "footer.about",
    detail: "Mission and how ContentVerse India works",
    icon: BookOpen,
  },
] as const;

/** Server-rendered editorial copy on the homepage for crawlers and quality review. */
export async function HomeEditorialSection() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <section
      className="border-y border-border/60 bg-muted/40"
      aria-labelledby="about-contentverse-heading"
    >
      <div className="container max-w-7xl py-12 md:py-16">
        <div className="flex items-start justify-center gap-4 lg:gap-6 xl:gap-8">
          <StickyRailAd
            slotKey="sidebar"
            sticky={false}
            label="Sponsored left"
            className="pt-2"
          />

          <div className="min-w-0 w-full max-w-3xl">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="v2-eyebrow mb-1">{t(dict, "home.aboutEyebrow")}</p>
                <h2
                  id="about-contentverse-heading"
                  className="font-display text-2xl font-bold tracking-tight md:text-4xl"
                >
                  {t(dict, "home.aboutTitle")}
                </h2>
              </div>
            </div>

            <div className="v2-raised space-y-4 p-6 leading-relaxed text-muted-foreground md:p-8">
              <p>{t(dict, "home.aboutP1")}</p>
              <details className="group space-y-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                  <span className="group-open:hidden">{t(dict, "home.aboutReadMore")}</span>
                  <span className="hidden group-open:inline">{t(dict, "home.aboutShowLess")}</span>
                </summary>
                <p>
                  {t(dict, "home.aboutP2Before")}{" "}
                  <Link
                    href="/guides"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    {t(dict, "home.aboutP2Guides")}
                  </Link>{" "}
                  {t(dict, "home.aboutP2Mid")}{" "}
                  <Link
                    href="/blogs"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    {t(dict, "home.aboutP2Articles")}
                  </Link>{" "}
                  {t(dict, "home.aboutP2After")}
                </p>
                <p>
                  {t(dict, "home.aboutP3Before")}{" "}
                  <Link
                    href="/creator-program"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    {t(dict, "home.aboutP3Creator")}
                  </Link>{" "}
                  {t(dict, "home.aboutP3Mid")}{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    {t(dict, "home.aboutP3Terms")}
                  </Link>
                  {t(dict, "home.aboutP3After")}
                </p>
                <p>
                  {t(dict, "home.aboutP4Before")}{" "}
                  <Link
                    href="/policy"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    {t(dict, "home.aboutP4Policy")}
                  </Link>{" "}
                  {t(dict, "home.aboutP4Mid")}{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    {t(dict, "home.aboutP4Privacy")}
                  </Link>{" "}
                  {t(dict, "home.aboutP4After")}
                </p>
              </details>
            </div>

            <nav
              aria-label="Legal and policy pages"
              className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {POLICY_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="v2-surface v2-lift group flex items-start gap-3 p-4"
                >
                  <item.icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      {t(dict, item.labelKey)}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          <StickyRailAd
            slotKey="hub"
            sticky={false}
            label="Sponsored right"
            className="pt-2"
          />
        </div>
      </div>
    </section>
  );
}
