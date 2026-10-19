import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  LayoutGrid,
  Mail,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { DisableAutoAds } from "@/components/ads/disable-auto-ads";
import { AdvertiseForm } from "@/components/site/advertise-form";
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
  },
  {
    title: "Sponsored stories",
    body: "Native articles or guides that match our editorial tone — clearly labelled as sponsored.",
  },
  {
    title: "Hub sponsorship",
    body: "Own a module moment — Sports, India Tools, Finance, Trending, Jobs, or GoldVerse.",
  },
] as const;

export default function AdvertisePage() {
  return (
    <div className="container max-w-5xl py-12 md:py-16">
      <DisableAutoAds />
      <PageBack href="/" label="Home" className="mb-6" />

      <div className="mb-12 max-w-2xl">
        <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-neon-purple">
          <Megaphone className="h-3.5 w-3.5" />
          Advertise
        </p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          Run ads on ContentVerse India
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Reach Indian readers across guides, tools, sports, finance, jobs and
          blogs. Share your brief below — we will reply with availability,
          formats and pricing.
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {PLACEMENTS.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border bg-card/60 p-5"
          >
            <h2 className="font-display text-base font-bold">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <AdvertiseForm />

        <aside className="space-y-6">
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <h2 className="font-display text-lg font-bold">Why brands book us</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-neon-cyan" />
                India-focused audience across practical tools and explainers.
              </li>
              <li className="flex gap-3">
                <LayoutGrid className="mt-0.5 h-4 w-4 shrink-0 text-neon-purple" />
                Fixed placements plus contextual hubs (Sports, Tools, Finance…).
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neon-orange" />
                Clear sponsorship labelling — AdSense policy-aware inventory.
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-neon-blue" />
                Response within 1–2 business days.
              </li>
            </ul>
          </div>

          <div className="space-y-3 rounded-2xl border bg-card p-6 text-sm">
            <h2 className="font-display text-lg font-bold">Prefer email?</h2>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Advertising inquiry — ContentVerse India")}`}
              className="flex items-center gap-2 text-neon-purple hover:underline"
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span className="break-all">{CONTACT_EMAIL}</span>
            </a>
            <p className="text-muted-foreground">
              Subject tip: start with{" "}
              <span className="font-medium text-foreground">Advertise:</span>{" "}
              plus your brand name.
            </p>
            <p className="text-muted-foreground">
              General support? Use{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact
              </Link>
              . Media assets:{" "}
              <Link href="/press-kit" className="text-primary hover:underline">
                Press kit
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
