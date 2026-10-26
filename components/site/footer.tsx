import Link from "next/link";
import type { ElementType } from "react";
import { Logo } from "./logo";
import { FooterVisitorCount } from "./footer-visitor-count";
import { getSiteLogoUrl } from "@/lib/branding/site-logo";
import { Github, Twitter, Instagram, Youtube } from "lucide-react";
import { SITE } from "@/lib/seo";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { TelegramIcon } from "@/components/icons/telegram-icon";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { withLocalePrefix } from "@/lib/i18n/config";

const SOCIAL_LINKS: { label: string; href: string; Icon: ElementType }[] = [
  { label: "Twitter / X", href: SITE.sameAs[0] || "https://twitter.com/contentverse", Icon: Twitter },
  { label: "Instagram", href: SITE.sameAs[1] || "https://www.instagram.com/contentverse", Icon: Instagram },
  { label: "YouTube", href: SITE.sameAs[2] || "https://www.youtube.com/@contentverse", Icon: Youtube },
  { label: "GitHub", href: SITE.sameAs[3] || "https://github.com/devDhananjay/ContentVersa", Icon: Github },
];

const WHATSAPP_CHANNEL = process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL?.trim();
const TELEGRAM_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_URL?.trim() || SITE.telegram;

const TOOLS = [
  { label: "All India Tools", href: "/tools" },
  { label: "Salary Tax Calculator", href: "/tools/salary-tax-calculator" },
  { label: "Merge PDF", href: "/tools/merge-pdf" },
  { label: "Weather", href: "/tools/weather" },
  { label: "IFSC Finder", href: "/tools/ifsc-finder" },
  { label: "HUID Verify", href: "/huid-verification" },
] as const;

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
    </Link>
  );
}

function FooterNavColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
  className?: string;
}) {
  return (
    <nav aria-label={title} className={className}>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/80">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <FooterLink href={l.href} label={l.label} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export async function Footer() {
  const logoSrc = await getSiteLogoUrl();
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const L = (path: string, href: string) => ({
    label: t(dict, path),
    href: withLocalePrefix(href, locale),
  });

  const explore = [
    L("footer.indiaGuides", "/guides"),
    L("footer.blogs", "/blogs"),
    L("footer.govtSchemes", "/guides/schemes"),
    L("footer.indiaTools", "/tools"),
    { label: "ContentVerse India AI", href: withLocalePrefix("/ai", locale) },
    L("footer.trending", "/trending"),
    L("footer.sports", "/sports"),
    L("footer.finance", "/finance"),
    { label: "CineVerse", href: withLocalePrefix("/cineverse", locale) },
    { label: "GoldVerse", href: withLocalePrefix("/goldverse", locale) },
    { label: "MoneyVerse", href: withLocalePrefix("/moneyverse", locale) },
    L("nav.jobs", "/jobs"),
    L("nav.results", "/results"),
    { label: "Reels", href: withLocalePrefix("/reels", locale) },
    { label: "Categories", href: withLocalePrefix("/categories", locale) },
  ];
  const creators = [
    L("footer.write", "/dashboard/create"),
    L("nav.dashboard", "/dashboard"),
    L("footer.monetization", "/dashboard/earnings"),
    L("footer.creatorProgram", "/creator-program"),
    L("footer.leaderboard", "/leaderboard"),
  ];
  const company = [
    L("footer.about", "/about"),
    L("footer.careers", "/careers"),
    L("footer.press", "/press"),
    { label: "Press Kit", href: withLocalePrefix("/press-kit", locale) },
    L("footer.advertise", "/advertise"),
    L("footer.contact", "/contact"),
  ];
  const legal = [
    L("footer.terms", "/terms"),
    L("footer.privacy", "/privacy"),
    L("footer.cookies", "/cookies"),
    L("footer.contentPolicy", "/policy"),
    L("footer.siteMap", "/site-map"),
    { label: "Sitemap", href: "/sitemap.xml" },
  ];
  const tools = TOOLS.map((x) => ({
    ...x,
    href: withLocalePrefix(x.href, locale),
  }));

  return (
    <footer className="relative mt-24 border-t border-border bg-card/60">
      <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-7xl -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container py-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)] lg:gap-14">
          <div>
            <Logo src={logoSrc} size="lg" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {SITE.searchName} — {t(dict, "footer.tagline")}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              {WHATSAPP_CHANNEL ? (
                <a
                  href={WHATSAPP_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Channel"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#25D366]/40 text-[#25D366] transition-colors hover:border-[#25D366]"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
              ) : null}
              {TELEGRAM_URL ? (
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#26A5E4]/40 text-[#26A5E4] transition-colors hover:border-[#26A5E4]"
                >
                  <TelegramIcon className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
            <FooterNavColumn title={t(dict, "footer.explore")} links={explore} />
            <FooterNavColumn title={t(dict, "footer.tools")} links={tools} />
            <FooterNavColumn title={t(dict, "footer.creators")} links={creators} />
            <FooterNavColumn title={t(dict, "footer.company")} links={company} />
          </div>
        </div>

        <FooterVisitorCount />

        <div className="mt-8 flex flex-col gap-4 border-t border-border/50 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ContentVerse India. {t(dict, "footer.rights")}
          </p>
          <nav
            aria-label={t(dict, "footer.legal")}
            className="flex flex-wrap items-center gap-x-4 gap-y-2"
          >
            {legal.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
