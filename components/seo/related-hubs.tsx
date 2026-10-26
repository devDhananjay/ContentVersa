"use client";

import { ArrowRight } from "lucide-react";
import { MultiplexAd } from "@/components/ads/multiplex-ad";
import { LocaleLink } from "@/components/i18n/locale-link";
import { useDictionary } from "@/components/i18n/use-dictionary";
import { cn } from "@/lib/utils";
import {
  getRelatedHubLinks,
  type RelatedHubId,
} from "@/lib/seo/related-hubs";

type Props = {
  current: RelatedHubId;
  title?: string;
  className?: string;
  /** Wrap in site container (for hub pages without their own container). */
  contained?: boolean;
  /** Show a Multiplex (recommended-style) ad under the links. */
  multiplex?: boolean;
};

/** Crawlable cross-hub links — strengthens internal PageRank between modules. */
export function RelatedHubs({
  current,
  title,
  className,
  contained = false,
  multiplex = true,
}: Props) {
  const { t } = useDictionary();
  const links = getRelatedHubLinks(current);
  if (links.length === 0) return null;
  const heading = title ?? t("hubs.relatedTitle");

  const nav = (
    <nav
      aria-label={heading}
      className={cn("rounded-3xl border bg-card p-6 md:p-8", className)}
    >
      <h2 className="font-display text-lg font-bold mb-4">{heading}</h2>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <LocaleLink
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3.5 py-1.5 text-sm font-medium hover:border-neon-purple/40 hover:text-neon-purple transition-colors"
          >
            {link.label}
            <ArrowRight className="h-3.5 w-3.5 opacity-60" aria-hidden />
          </LocaleLink>
        ))}
      </div>
      {multiplex ? <MultiplexAd className="mt-6" /> : null}
    </nav>
  );

  if (contained) {
    return <div className="container py-8 md:py-10">{nav}</div>;
  }
  return nav;
}
