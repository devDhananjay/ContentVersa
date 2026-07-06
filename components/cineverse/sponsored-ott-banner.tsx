import Link from "next/link";
import { Megaphone, ExternalLink } from "lucide-react";
import { getCineverseSponsor } from "@/lib/cineverse/sponsors";

export function SponsoredOttBanner() {
  const sponsor = getCineverseSponsor();
  if (!sponsor) return null;

  return (
    <aside className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card to-card p-5 md:p-6">
      <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-400">
        <Megaphone className="h-3 w-3" />
        {sponsor.partner}
      </p>
      <h3 className="mt-2 font-display text-lg font-bold">{sponsor.title}</h3>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">{sponsor.subtitle}</p>
      <Link
        href={sponsor.href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-amber-400"
      >
        {sponsor.cta}
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </aside>
  );
}
