import Link from "next/link";
import { Logo } from "./logo";
import { FooterVisitorCount } from "./footer-visitor-count";
import { getSiteLogoUrl } from "@/lib/branding/site-logo";
import { Github, Twitter, Instagram, Youtube } from "lucide-react";

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
      { label: "HUID Verification", href: "/huid-verification" },
      { label: "India Tools", href: "/tools" },
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
              {[Twitter, Github, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social link"
                  className="h-9 w-9 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-neon-purple/60 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
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
