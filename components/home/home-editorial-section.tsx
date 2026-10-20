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

const POLICY_LINKS = [
  {
    href: "/policy",
    label: "Content Policy",
    detail: "What we publish and what we remove",
    icon: FileText,
  },
  {
    href: "/privacy",
    label: "Privacy Policy",
    detail: "DPDP Act & how we handle your data",
    icon: Shield,
  },
  {
    href: "/terms",
    label: "Terms of Service",
    detail: "Account rules and your rights",
    icon: Scale,
  },
  {
    href: "/cookies",
    label: "Cookie Policy",
    detail: "Essential, analytics & ad cookies",
    icon: Cookie,
  },
  {
    href: "/creator-program",
    label: "Creator Program",
    detail: "Quality bar, tips & featuring",
    icon: Users,
  },
  {
    href: "/about",
    label: "About us",
    detail: "Mission and how ContentVerse India works",
    icon: BookOpen,
  },
] as const;

/** Server-rendered editorial copy on the homepage for crawlers and quality review. */
export function HomeEditorialSection() {
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
                <p className="v2-eyebrow mb-1">About the platform</p>
                <h2
                  id="about-contentverse-heading"
                  className="font-display text-2xl font-bold tracking-tight md:text-4xl"
                >
                  What is ContentVerse India?
                </h2>
              </div>
            </div>

            <div className="v2-raised space-y-4 p-6 leading-relaxed text-muted-foreground md:p-8">
              <p>
                ContentVerse India is an India-first publishing platform where writers, journalists, and
                creators publish long-form articles, tutorials, and opinion pieces in English and Hindi.
                Unlike short-form feeds built only for scrolling, we focus on depth: thoughtful essays,
                explainers, and reporting that readers bookmark and share.
              </p>
              <details className="group space-y-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                  <span className="group-open:hidden">Read more about how we work</span>
                  <span className="hidden group-open:inline">Show less</span>
                </summary>
                <p>
                  Start with our{" "}
                  <Link
                    href="/guides"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    India Guides
                  </Link>{" "}
                  on money, government schemes, jobs, and everyday how-tos — then read{" "}
                  <Link
                    href="/blogs"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    original articles
                  </Link>{" "}
                  from the community. Live scores, market strips, and calculators exist to support that
                  reading; they are not the product we ask advertisers or search engines to judge us by.
                </p>
                <p>
                  Our editorial team and community moderators review submissions before they go live. We
                  remove plagiarism, spam, and low-effort AI dumps. Creators who meet our quality bar can
                  join the{" "}
                  <Link
                    href="/creator-program"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    Creator Program
                  </Link>{" "}
                  and earn through tips, featured placement, and transparent analytics — always in Indian
                  Rupees (₹), with applicable taxes and payout rules disclosed in our{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                  .
                </p>
                <p>
                  Our{" "}
                  <Link
                    href="/policy"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    Content Policy
                  </Link>{" "}
                  explains what we publish and what we do not, in line with Indian law and Google AdSense
                  publisher standards. We process personal data under India&apos;s Digital Personal Data
                  Protection Act, 2023 (DPDP Act). Read our{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/cookies"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    Cookie Policy
                  </Link>{" "}
                  for advertising cookies (including Google AdSense), your rights, and how to contact us.
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
                      {item.label}
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
