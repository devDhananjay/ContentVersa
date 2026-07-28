import Link from "next/link";
import type { ElementType } from "react";
import { Logo } from "./logo";
import { FooterVisitorCount } from "./footer-visitor-count";
import { getSiteLogoUrl } from "@/lib/branding/site-logo";
import { Github, Twitter, Instagram, Youtube } from "lucide-react";
import { SITE } from "@/lib/seo";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

const SOCIAL_LINKS: { label: string; href: string; Icon: ElementType }[] = [
  { label: "Twitter / X", href: SITE.sameAs[0] || "https://twitter.com/contentverse", Icon: Twitter },
  { label: "Instagram", href: SITE.sameAs[1] || "https://www.instagram.com/contentverse", Icon: Instagram },
  { label: "YouTube", href: SITE.sameAs[2] || "https://www.youtube.com/@contentverse", Icon: Youtube },
  { label: "GitHub", href: SITE.sameAs[3] || "https://github.com/devDhananjay/ContentVersa", Icon: Github },
];

const WHATSAPP_CHANNEL = process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL?.trim();

const FOOTER_COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Sports", href: "/sports" },
      { label: "Finance", href: "/finance" },
      { label: "CineVerse", href: "/cineverse" },
      { label: "GoldVerse", href: "/goldverse" },
      { label: "MoneyVerse", href: "/moneyverse" },
      { label: "Screenshot Scan (OCR)", href: "/moneyverse/screenshot-scan" },
      { label: "Bank Statement Analyzer", href: "/moneyverse/bank-statement-analyzer" },
      { label: "HUID Verification", href: "/huid-verification" },
      { label: "India Tools", href: "/tools" },
      { label: "Merge PDF", href: "/tools/merge-pdf" },
      { label: "Weather", href: "/tools/weather" },
      { label: "Nearby Places", href: "/tools/nearby-places" },
      { label: "RTO Finder", href: "/tools/rto-finder" },
      { label: "Fuel Price", href: "/tools/fuel-price" },
      { label: "IFSC Finder", href: "/tools/ifsc-finder" },
      { label: "Jobs", href: "/jobs" },
      { label: "Reels", href: "/reels" },
      { label: "Explore Blogs", href: "/blogs" },
      { label: "Categories", href: "/categories" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
  },
  {
    title: "Creators",
    links: [
      { label: "Write", href: "/dashboard/create" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Monetization", href: "/dashboard/earnings" },
      { label: "Creator Program", href: "/creator-program" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
      { label: "Content Policy", href: "/policy" },
      { label: "Site Map", href: "/site-map" },
    ],
  },
];

export async function Footer() {
  const logoSrc = await getSiteLogoUrl();

  return (
    <footer className="relative mt-32 border-t border-border/50 bg-background">
      <div className="absolute inset-x-0 top-0 -translate-y-1/2 mx-auto h-px max-w-7xl bg-gradient-to-r from-transparent via-neon-purple/40 to-transparent" />
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <Logo src={logoSrc} size="lg" />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              A next-generation creator platform built for the 2026 internet. Read deeply, create boldly, grow with a community of bold writers.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-neon-purple/60 transition-colors"
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
                  className="h-9 w-9 rounded-xl border border-[#25D366]/40 flex items-center justify-center text-[#25D366] hover:border-[#25D366] transition-colors"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <FooterVisitorCount />

        <div className="mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ContentVerse. Built for creators. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with intent · v1.0
          </p>
        </div>
      </div>
    </footer>
  );
}
