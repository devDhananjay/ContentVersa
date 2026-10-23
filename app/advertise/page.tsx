import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  LayoutGrid,
  Mail,
  Megaphone,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { DisableAutoAds } from "@/components/ads/disable-auto-ads";
import { AdvertiseForm } from "@/components/site/advertise-form";
import { AdvertiseLiveInventory } from "@/components/site/advertise-live-inventory";
import { AdvertisePreviewProvider } from "@/components/site/advertise-preview-context";
import { PageBack } from "@/components/site/page-back";
import { buildMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/site-contact";

export const metadata: Metadata = buildMetadata({
  title: "Advertise on ContentVerse India",
  description:
    "Run display ads, sponsored articles, or hub sponsorships on ContentVerse India. Request a media kit and campaign quote — India audience across Guides, Tools, Sports, Finance and more.",
  path: "/advertise",
  keywords: [
    "advertise on ContentVerse India",
    "ContentVerse India advertising",
    "sponsored content India",
    "display ads India publishers",
    "media kit ContentVerse",
  ],
});

const PLACEMENTS = [
  {
    title: "Display units",
    body: "Horizontal bands, MREC, and sidebar rails on high-traffic hubs and article pages.",
    icon: MonitorPlay,
    tag: "Always-on",
  },
  {
    title: "Sponsored stories",
    body: "Native articles or guides that match our editorial tone — clearly labelled as sponsored.",
    icon: FileText,
    tag: "Brand story",
  },
  {
    title: "Hub sponsorship",
    body: "Own a module moment — Sports, India Tools, Finance, Trending, Jobs, or GoldVerse.",
    icon: LayoutGrid,
    tag: "Category own",
  },
] as const;

const STEPS = [
  { n: "01", title: "Share a brief", body: "Brand, format, hubs, and dates." },
  { n: "02", title: "Get a quote", body: "Slots, rates, and creative specs." },
  { n: "03", title: "Go live", body: "Launch with clear sponsorship labels." },
] as const;

export default function AdvertisePage() {
  return (
    <AdvertisePreviewProvider>
    <div className="relative overflow-hidden">
      <DisableAutoAds />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[42rem]"
        style={{
          background:
            "radial-gradient(58% 46% at 48% -8%, hsl(var(--primary) / 0.2), transparent 70%), radial-gradient(40% 36% at 94% 6%, hsl(var(--saffron) / 0.18), transparent 64%), radial-gradient(34% 30% at 6% 22%, hsl(var(--accent) / 0.1), transparent 58%)",
        }}
      />

      <div className="container relative max-w-5xl py-10 md:py-14">
        <PageBack href="/" label="Home" className="mb-8" />

        {/* Hero */}
        <section className="relative mb-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative z-10 max-w-xl">
              <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[hsl(var(--saffron))] text-white shadow-[0_8px_20px_-10px_hsl(var(--primary)/0.8)]">
                  <Megaphone className="h-3 w-3" />
                </span>
                ContentVerse India · Advertise
              </p>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
                Reach India&apos;s{" "}
                <span className="text-gradient">curious readers</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                Display, native stories, and hub sponsorships across guides,
                tools, sports, finance and jobs. Send a short brief — we reply
                with formats and pricing.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#advertise-form"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-[hsl(var(--saffron))] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_-14px_hsl(var(--primary)/0.75)] transition hover:brightness-105"
                >
                  Start your brief
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Advertising inquiry — ContentVerse India")}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2.5 text-sm font-medium backdrop-blur-sm transition hover:border-primary/35"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  {CONTACT_EMAIL}
                </a>
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Typical reply in 1–2 business days
              </p>
            </div>

            <AdvertiseLiveInventory />
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            How it works
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-[hsl(var(--saffron))]/20 font-display text-sm font-bold text-primary ring-1 ring-inset ring-primary/15">
                  {step.n}
                </div>
                <div>
                  <h2 className="font-display text-base font-bold">{step.title}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{step.body}</p>
                </div>
                {i < STEPS.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute -right-2 top-5 hidden h-px w-4 bg-border sm:block"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* Placements */}
        <section className="mb-14">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Formats
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
                Where your brand shows up
              </h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {PLACEMENTS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5 transition hover:border-primary/30"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition group-hover:opacity-100"
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-[hsl(var(--saffron))]/20 ring-1 ring-inset ring-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="relative mt-4 font-display text-base font-bold">
                    {item.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Form + aside */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
          <div id="advertise-form" className="scroll-mt-28">
            <AdvertiseForm />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-[0_16px_40px_-32px_hsl(var(--primary)/0.45)]">
              <div className="border-b border-border/50 bg-gradient-to-r from-primary/12 via-transparent to-[hsl(var(--saffron))]/12 px-5 py-3.5">
                <h2 className="inline-flex items-center gap-2 font-display text-base font-bold">
                  <Sparkles className="h-4 w-4 text-[hsl(var(--saffron))]" />
                  Why brands book us
                </h2>
              </div>
              <ul className="space-y-4 p-5 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-neon-cyan" />
                  India-first audience on practical tools and explainers.
                </li>
                <li className="flex gap-3">
                  <LayoutGrid className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Fixed placements plus contextual hubs.
                </li>
                <li className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--saffron))]" />
                  Clear sponsorship labels — policy-aware inventory.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neon-blue" />
                  Reply within 1–2 business days.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/[0.07] to-[hsl(var(--saffron))]/[0.08] p-5 text-sm">
              <h2 className="font-display text-base font-bold">Prefer email?</h2>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Advertising inquiry — ContentVerse India")}`}
                className="mt-3 flex items-center gap-2 break-all font-medium text-primary hover:underline"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {CONTACT_EMAIL}
              </a>
              <p className="mt-3 text-muted-foreground">
                Subject tip: start with{" "}
                <span className="font-medium text-foreground">Advertise:</span>{" "}
                plus your brand name.
              </p>
              <p className="mt-3 text-muted-foreground">
                <Link href="/contact" className="text-primary hover:underline">
                  Contact
                </Link>
                {" · "}
                <Link href="/press-kit" className="text-primary hover:underline">
                  Press kit
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
    </AdvertisePreviewProvider>
  );
}
