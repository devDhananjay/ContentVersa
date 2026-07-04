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
    detail: "Mission and how ContentVerse works",
    icon: BookOpen,
  },
] as const;

/** Server-rendered editorial copy on the homepage for crawlers and quality review. */
export function HomeEditorialSection() {
  return (
    <section
      className="border-y border-border/50 bg-muted/20"
      aria-labelledby="about-contentverse-heading"
    >
      <div className="container py-12 md:py-16 max-w-5xl">
        <div className="flex items-start gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-neon-purple/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-neon-purple" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-neon-purple mb-1">
              About the platform
            </p>
            <h2
              id="about-contentverse-heading"
              className="font-display text-2xl md:text-3xl font-extrabold tracking-tight"
            >
              What is ContentVerse?
            </h2>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 text-muted-foreground leading-relaxed">
          <p>
            ContentVerse is an India-first publishing platform where writers, journalists, and
            creators publish long-form articles, tutorials, and opinion pieces in English and Hindi.
            Unlike short-form feeds built only for scrolling, we focus on depth: thoughtful essays,
            explainers, and reporting that readers bookmark and share.
          </p>
          <p>
            Our editorial team and community moderators review submissions before they go live. We
            remove plagiarism, spam, and low-effort AI dumps. Creators who meet our quality bar can
            join the{" "}
            <Link
              href="/creator-program"
              className="font-medium text-foreground underline underline-offset-4 hover:text-neon-purple"
            >
              Creator Program
            </Link>{" "}
            and earn through tips, featured placement, and transparent analytics — always in Indian
            Rupees (₹), with applicable taxes and payout rules disclosed in our{" "}
            <Link
              href="/terms"
              className="font-medium text-foreground underline underline-offset-4 hover:text-neon-purple"
            >
              Terms of Service
            </Link>
            .
          </p>
          <p>
            Browse{" "}
            <Link
              href="/blogs"
              className="font-medium text-foreground underline underline-offset-4 hover:text-neon-purple"
            >
              original articles
            </Link>{" "}
            across technology, finance, lifestyle, sports, and careers. Live cricket scores, market
            data, and job listings complement our writing — they are utilities for readers, not
            standalone pages we ask search engines to rank. Our{" "}
            <Link
              href="/policy"
              className="font-medium text-foreground underline underline-offset-4 hover:text-neon-purple"
            >
              Content Policy
            </Link>{" "}
            explains what we publish and what we do not, in line with Indian law and Google AdSense
            publisher standards.
          </p>
          <p>
            We process personal data under India&apos;s Digital Personal Data Protection Act, 2023
            (DPDP Act) and operate as an intermediary under the Information Technology Act, 2000 and
            the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. Read our{" "}
            <Link
              href="/privacy"
              className="font-medium text-foreground underline underline-offset-4 hover:text-neon-purple"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/cookies"
              className="font-medium text-foreground underline underline-offset-4 hover:text-neon-purple"
            >
              Cookie Policy
            </Link>{" "}
            for advertising cookies (including Google AdSense), your rights, and how to contact us.
          </p>
        </div>

        <nav
          aria-label="Legal and policy pages"
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {POLICY_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-start gap-3 rounded-2xl border bg-card p-4 hover:border-neon-purple/40 hover:bg-card/80 transition-colors"
            >
              <item.icon
                className="h-5 w-5 text-neon-purple shrink-0 mt-0.5"
                aria-hidden
              />
              <span>
                <span className="block font-semibold text-sm text-foreground group-hover:text-neon-purple transition-colors">
                  {item.label}
                </span>
                <span className="block text-xs text-muted-foreground mt-0.5">
                  {item.detail}
                </span>
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
