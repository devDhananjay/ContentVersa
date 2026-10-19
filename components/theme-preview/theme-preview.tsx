"use client";

import * as React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Eye,
  Flame,
  Heart,
  Mail,
  MessageCircle,
  Moon,
  Search,
  Sparkles,
  Sun,
  Trophy,
  Wallet,
  Wrench,
} from "lucide-react";
import { Reveal } from "@/components/home/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Mode = "light" | "dark";
type View = "both" | Mode;
type Accent = "indigo" | "saffron";

const TICKER = [
  { s: "NIFTY 50", v: "22,889", c: "-1.11%", up: false },
  { s: "SENSEX", v: "73,853", c: "-1.17%", up: false },
  { s: "JSWSTEEL", v: "", c: "+2.06%", up: true },
  { s: "ONGC", v: "", c: "+1.35%", up: true },
  { s: "SBIN", v: "", c: "+1.15%", up: true },
  { s: "LT", v: "", c: "+0.96%", up: true },
];

const CHIPS = ["#Technology", "#AI", "#Finance", "#Schemes", "#Jobs", "#Gold"];

const MODULES = [
  { icon: BookOpen, name: "India Guides", stat: "120+", sub: "long-form explainers", big: true },
  { icon: Wallet, name: "MoneyVerse", stat: "37", sub: "free calculators" },
  { icon: Briefcase, name: "Jobs", stat: "Daily", sub: "govt + private" },
  { icon: Wrench, name: "India Tools", stat: "37", sub: "with guides" },
  { icon: Trophy, name: "Sports", stat: "Live", sub: "scores and news" },
];

const STORIES = [
  {
    cat: "Money",
    title: "SIP vs lump sum: what actually works for a first-time Indian investor",
    by: "Dhananjay Singh",
    tone: "from-indigo-500/80 to-fuchsia-500/60",
  },
  {
    cat: "Schemes",
    title: "PM-Kisan eligibility, installments and how to fix a rejected application",
    by: "Editorial team",
    tone: "from-amber-500/80 to-rose-500/60",
  },
  {
    cat: "Gold",
    title: "HUID explained: how to verify hallmarked gold before you pay",
    by: "Editorial team",
    tone: "from-emerald-500/70 to-sky-500/60",
  },
];

function Frame({ mode, accent }: { mode: Mode; accent: Accent }) {
  return (
    <div
      className="theme-v2 relative isolate overflow-hidden rounded-[28px] border border-border bg-background text-foreground shadow-xl"
      data-mode={mode}
      data-accent={accent}
    >
      {/* Mode label */}
      <div className="absolute right-4 top-4 z-20 hidden items-center gap-1.5 rounded-full border border-border bg-card/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur lg:inline-flex">
        {mode === "light" ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
        {mode} mode
      </div>

      {/* Header + ticker */}
      <header className="relative z-10 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-5">
          <span className="font-display text-lg font-bold tracking-tight">
            Content<span className="v2-gradient-text">Verse</span>
          </span>
          <nav className="ml-3 hidden items-center gap-0.5 rounded-full border border-border/70 bg-muted/60 p-0.5 text-xs font-medium text-muted-foreground lg:flex">
            {["Guides", "Tools", "Money", "Sports", "Jobs"].map((n, i) => (
              <span
                key={n}
                className={cn(
                  "rounded-full px-3 py-1.5",
                  i === 0 && "bg-card text-foreground shadow-sm"
                )}
              >
                {n}
              </span>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 pr-0 lg:pr-32">
            <span className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted">
              <Search className="h-4 w-4" />
            </span>
            <span className="v2-btn-primary inline-flex h-9 items-center rounded-full px-4 text-xs font-semibold">
              Sign in
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-hidden border-t border-border/60 bg-muted/40 px-5 py-2">
          {TICKER.map((t) => (
            <span
              key={t.s}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1 text-xs"
            >
              <span className="font-semibold">{t.s}</span>
              {t.v ? <span className="text-muted-foreground">{t.v}</span> : null}
              <span
                className={
                  t.up
                    ? "text-[hsl(var(--positive))]"
                    : "text-[hsl(var(--negative))]"
                }
              >
                {t.c}
              </span>
            </span>
          ))}
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-16 pt-14 text-center md:px-10 md:pb-20 md:pt-20">
        <div className="v2-aurora" />
        <div className="v2-dots absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_30%,#000,transparent)]" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-3 w-3 text-accent" />
            India&apos;s original guides, explainers and stories
          </span>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-[-0.02em] md:text-6xl lg:text-7xl">
            Read what actually
            <br />
            helps you <span className="v2-gradient-text italic">in India.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Human-reviewed explainers on money, schemes, jobs and gold. Free
            calculators and live scores sit underneath, not in front.
          </p>

          <div className="relative mt-9 w-full max-w-xl">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              readOnly
              placeholder="Search ‘SIP’, ‘CIBIL’, ‘HUID’, ‘PM-Kisan’…"
              className="h-14 rounded-2xl border-border bg-card pr-32 text-base shadow-[var(--v2-shadow-md)] placeholder:text-muted-foreground/80"
              style={{ paddingLeft: "3.25rem" }}
            />
            <span className="v2-btn-primary absolute right-2 top-1/2 inline-flex h-10 -translate-y-1/2 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold">
              Search <ArrowRight className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {CHIPS.map((c) => (
              <span key={c} className="v2-chip cursor-pointer">
                {c}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <span className="v2-btn-primary inline-flex h-12 items-center gap-2 rounded-2xl px-7 text-base font-semibold">
              <BookOpen className="h-5 w-5" /> Read India Guides
            </span>
            <span className="inline-flex h-12 items-center gap-2 rounded-2xl border border-border bg-card px-7 text-base font-semibold shadow-sm">
              Browse articles <ArrowRight className="h-4 w-4" />
            </span>
          </div>

          <dl className="mt-14 grid w-full max-w-lg grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card/70 py-4 backdrop-blur">
            {[
              ["120+", "India guides"],
              ["37", "Free tools"],
              ["Daily", "Jobs + scores"],
            ].map(([v, l]) => (
              <div key={l} className="px-3">
                <dt className="font-display text-2xl font-bold md:text-3xl">{v}</dt>
                <dd className="mt-0.5 text-xs text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Bento modules */}
      <section className="border-t border-border/70 px-5 py-14 md:px-10">
        <Reveal y={18}>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="v2-eyebrow">Explore the platform</p>
              <h2 className="mt-1.5 font-display text-3xl font-bold tracking-tight md:text-4xl">
                One place, every part of daily India.
              </h2>
            </div>
            <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold shadow-sm">
              All modules <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Reveal>
        <Reveal y={22} delay={0.05}>
          <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
            {MODULES.map((m) => (
              <div
                key={m.name}
                className={cn(
                  "v2-raised v2-lift group relative flex flex-col justify-between overflow-hidden p-5",
                  m.big && "md:col-span-2 md:row-span-2 md:p-7"
                )}
              >
                {m.big ? <div className="v2-aurora opacity-70" /> : null}
                <div className="relative flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <m.icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
                </div>
                <div className="relative mt-8">
                  <p
                    className={cn(
                      "font-display font-bold tracking-tight",
                      m.big ? "text-6xl md:text-7xl" : "text-3xl"
                    )}
                  >
                    {m.stat}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{m.sub}</p>
                  <p className="mt-3 font-semibold">{m.name}</p>
                  {m.big ? (
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                      SIP, tax, schemes, HUID and more — written for Indian readers,
                      reviewed by people, updated when rules change.
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Trending */}
      <section className="border-t border-border/70 bg-muted/40 px-5 py-14 md:px-10">
        <Reveal y={18}>
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="v2-eyebrow inline-flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" /> Trending now
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Stories readers are opening <span className="v2-gradient-text italic">this week.</span>
              </h2>
            </div>
          </div>
        </Reveal>
        <Reveal y={22} delay={0.05}>
          <div className="grid gap-5 md:grid-cols-3">
            {STORIES.map((s, i) => (
              <article key={s.title} className="v2-raised v2-lift flex flex-col overflow-hidden">
                <div
                  className={cn(
                    "relative aspect-[16/10] bg-gradient-to-br",
                    s.tone
                  )}
                >
                  <div className="v2-dots absolute inset-0 opacity-60" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    {s.cat}
                  </span>
                  {i === 0 ? (
                    <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-black">
                      Editor&apos;s pick
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-xl font-semibold leading-snug tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    A clear, step-by-step walkthrough with examples, FAQs and the
                    official sources linked.
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{s.by}</span>
                    <span className="inline-flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> 1.2k
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" /> 48
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" /> 6
                      </span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Component kit */}
      <section className="border-t border-border/70 px-5 py-14 md:px-10">
        <p className="v2-eyebrow">Component kit</p>
        <h2 className="mt-1.5 font-display text-3xl font-bold tracking-tight">Buttons, badges, inputs</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="v2-surface space-y-5 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="v2-btn-primary inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold">
                Primary
              </span>
              <Button variant="secondary" className="rounded-xl">
                Secondary
              </Button>
              <Button variant="outline" className="rounded-xl">
                Outline
              </Button>
              <Button variant="ghost" className="rounded-xl">
                Ghost
              </Button>
              <Button variant="destructive" className="rounded-xl">
                Delete
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10" variant="outline">
                Guide
              </Badge>
              <Badge variant="secondary">Money</Badge>
              <Badge variant="outline">Updated 2026</Badge>
              <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                Sponsored
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-[hsl(var(--positive))]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input readOnly placeholder="Your name" className="rounded-xl" />
              <Input readOnly placeholder="you@email.com" className="rounded-xl" />
            </div>
          </div>
          <div className="v2-raised relative overflow-hidden p-6">
            <div className="v2-aurora opacity-60" />
            <div className="relative">
              <p className="v2-eyebrow inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Newsletter
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">
                One useful India explainer, every week.
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No spam. Unsubscribe anytime.
              </p>
              <div className="mt-5 flex gap-2">
                <Input readOnly placeholder="you@email.com" className="h-11 rounded-xl bg-background" />
                <span className="v2-btn-primary inline-flex h-11 shrink-0 items-center rounded-xl px-5 text-sm font-semibold">
                  Subscribe
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer sample */}
      <footer className="border-t border-border bg-card/60 px-5 py-8 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="font-display text-lg font-bold tracking-tight">
            Content<span className="v2-gradient-text">Verse</span> India
          </span>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {["About", "Advertise", "Contact", "Privacy", "Terms"].map((l) => (
              <span key={l} className="hover:text-foreground">
                {l}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          © 2026 ContentVerse India. Made for readers across India.
        </p>
      </footer>
    </div>
  );
}

const SWATCHES: Record<Mode, { name: string; cls: string }[]> = {
  light: [
    { name: "Paper", cls: "bg-[hsl(40_25%_97%)] text-[hsl(235_25%_11%)]" },
    { name: "Card", cls: "bg-white text-[hsl(235_25%_11%)]" },
    { name: "Ink", cls: "bg-[hsl(235_25%_11%)] text-white" },
    { name: "Indigo", cls: "bg-[hsl(245_75%_55%)] text-white" },
    { name: "Saffron", cls: "bg-[hsl(27_90%_41%)] text-white" },
  ],
  dark: [
    { name: "Ink", cls: "bg-[hsl(235_20%_6%)] text-[hsl(40_20%_96%)] border border-white/10" },
    { name: "Card", cls: "bg-[hsl(235_18%_9.5%)] text-[hsl(40_20%_96%)] border border-white/10" },
    { name: "Raised", cls: "bg-[hsl(235_16%_13%)] text-[hsl(40_20%_96%)]" },
    { name: "Indigo", cls: "bg-[hsl(245_90%_72%)] text-[hsl(235_35%_8%)]" },
    { name: "Saffron", cls: "bg-[hsl(32_95%_62%)] text-[hsl(235_35%_8%)]" },
  ],
};

function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="inline-flex rounded-full border border-border bg-muted/60 p-0.5">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              value === o.id
                ? "bg-foreground text-background shadow"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ThemePreview() {
  const [view, setView] = React.useState<View>("both");
  const [accent, setAccent] = React.useState<Accent>("indigo");

  const modes: Mode[] = view === "both" ? ["light", "dark"] : [view];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Design preview · not live
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Editorial Premium theme
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Warm paper light mode, deep ink dark mode, one refined accent. This
            page is private (noindex, no ads). Nothing on the live site uses
            these colours yet.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Segmented
            label="View"
            value={view}
            onChange={setView}
            options={[
              { id: "both", label: "Side by side" },
              { id: "light", label: "Light" },
              { id: "dark", label: "Dark" },
            ]}
          />
          <Segmented
            label="Accent"
            value={accent}
            onChange={setAccent}
            options={[
              { id: "indigo", label: "Indigo" },
              { id: "saffron", label: "Saffron-led" },
            ]}
          />
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {(["light", "dark"] as Mode[]).map((m) => (
          <div key={m} className="rounded-2xl border border-border bg-card p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {m} palette
            </p>
            <div className="flex gap-2">
              {SWATCHES[m].map((s) => (
                <div
                  key={s.name}
                  className={cn(
                    "flex h-14 flex-1 items-end rounded-xl p-2 text-[11px] font-semibold",
                    s.cls
                  )}
                >
                  {s.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "grid items-start gap-6",
          view === "both" && "2xl:grid-cols-2"
        )}
      >
        {modes.map((m) => (
          <Frame key={m} mode={m} accent={accent} />
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Open decisions</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Hero video: keep as a dark-mode-only cinematic layer, or drop it for a
            lighter, faster page (this preview uses an aurora instead).
          </li>
          <li>Accent: Indigo (default) or Saffron-led — use the switch above.</li>
          <li>
            Headings: the live site was meant to use the Source Serif 4 headline
            font but a font-family typo in the Tailwind config makes it fall back
            to Satoshi sans. This preview shows the intended serif. Approve to
            apply it site-wide, or keep sans.
          </li>
        </ul>
      </div>
    </div>
  );
}
