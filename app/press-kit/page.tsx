import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, ExternalLink, Mail } from "lucide-react";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { getSiteLogoUrl } from "@/lib/branding/site-logo";
import { CONTACT_EMAIL } from "@/lib/site-contact";
import { buildMetadata, SITE, SITE_LOGO_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Press Kit — Logo, Boilerplate & Citation Links",
  description:
    "Official ContentVerse India press kit: brand name, logo downloads, short/long boilerplate, and preferred citation URLs for journalists and partners.",
  path: "/press-kit",
  keywords: [
    "ContentVerse India press kit",
    "ContentVerse India media kit",
    "ContentVerse India logo",
    "ContentVerse India boilerplate",
  ],
});

const CITE_URLS = [
  { label: "Homepage", href: "/" },
  { label: "ContentVerse India AI", href: "/ai" },
  { label: "MoneyVerse", href: "/moneyverse" },
  { label: "GoldVerse / HUID", href: "/goldverse" },
  { label: "India Tools", href: "/tools" },
  { label: "Sarkari Result", href: "/results" },
  { label: "Jobs", href: "/jobs" },
  { label: "About", href: "/about" },
] as const;

export default async function PressKitPage() {
  const logoUrl = await getSiteLogoUrl();
  const absoluteLogo = logoUrl.startsWith("http")
    ? logoUrl
    : `${SITE.url}${logoUrl}`;
  const squareLogo = `${SITE.url}${SITE_LOGO_URL}`;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-neon-purple/10 via-neon-blue/5 to-transparent" />

      <div className="container relative max-w-3xl space-y-10 py-12 md:py-16">
        <header className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-purple">
            Press kit
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Media assets for ContentVerse India
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Use these assets when writing about ContentVerse India. Prefer linking to{" "}
            <a
              href={SITE.url}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {SITE.url.replace(/^https?:\/\//, "")}
            </a>{" "}
            or the citation URLs below — that is how quality backlinks are earned.
          </p>
        </header>

        <section className="space-y-4 rounded-3xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl font-bold">Brand name</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Always write <strong className="text-foreground">ContentVerse India</strong>{" "}
            — one word for ContentVerse, capital C and V, then India. Do not shorten to
            “CV” in headlines unless space is extremely limited.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tagline: <em className="text-foreground">Read. Create. Grow.</em>
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl font-bold">Logo</h2>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border bg-background p-3">
              <Image
                src={logoUrl}
                alt="ContentVerse India logo"
                width={80}
                height={80}
                className="h-full w-full object-contain"
              />
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={logoUrl}
                  download
                  className="inline-flex items-center gap-1.5 font-medium text-neon-purple hover:underline"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  Download current logo
                </a>
              </li>
              <li>
                <a
                  href={SITE_LOGO_URL}
                  download
                  className="inline-flex items-center gap-1.5 font-medium text-neon-purple hover:underline"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  Square icon (192px)
                </a>
              </li>
              <li className="text-muted-foreground break-all text-xs">
                Hotlink (logo): {absoluteLogo}
              </li>
              <li className="text-muted-foreground break-all text-xs">
                Hotlink (icon): {squareLogo}
              </li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            Do not recolour, stretch, or place the mark on busy backgrounds that hurt
            contrast.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl font-bold">Boilerplate</h2>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neon-purple">
                Short
              </p>
              <p className="text-foreground/90">
                ContentVerse India is a next-generation creator platform for readers and
                writers — built in India for depth, design, and fair rupee payouts.
              </p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neon-purple">
                Long
              </p>
              <p className="text-foreground/90">
                ContentVerse India (contentverse.co.in) is an India-first publishing
                platform where writers publish long-form articles, tutorials, and opinion
                in English and Hindi. The product includes editorial moderation, a Creator
                Program with tips in ₹, live utilities (sports, finance, jobs, tools), and
                ContentVerse India AI for summaries, resumes, and money document analysis.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl font-bold">Preferred citation URLs</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            When you mention a product, link the matching URL — these are the pages we
            want indexed partners to cite.
          </p>
          <ul className="space-y-2">
            {CITE_URLS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-neon-purple"
                >
                  {item.label}
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />
                </Link>
                <span className="ml-2 text-xs text-muted-foreground break-all">
                  {SITE.url}
                  {item.href === "/" ? "" : item.href}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 rounded-3xl border border-neon-purple/30 bg-gradient-to-r from-neon-purple/10 to-neon-blue/5 p-6 md:p-8">
          <h2 className="font-display text-xl font-bold">Press contact</h2>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-neon-purple" aria-hidden />
            <span>
              Media and partnership queries:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Press%20/%20backlink%20partnership`}
                className="font-medium text-foreground hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              . Response within 2 business days.
            </span>
          </p>
          <Link
            href="/press"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neon-purple hover:underline"
          >
            Full press page
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </section>

        <RelatedHubs current="blogs" title="Explore the product" />
      </div>
    </div>
  );
}
