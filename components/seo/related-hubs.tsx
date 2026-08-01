import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
};

/** Crawlable cross-hub links — strengthens internal PageRank between modules. */
export function RelatedHubs({
  current,
  title = "Also explore on ContentVerse India",
  className,
  contained = false,
}: Props) {
  const links = getRelatedHubLinks(current);
  if (links.length === 0) return null;

  const nav = (
    <nav
      aria-label="Related hubs"
      className={cn(
        "rounded-3xl border bg-card p-6 md:p-8",
        className
      )}
    >
      <h2 className="font-display text-lg font-bold mb-4">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3.5 py-1.5 text-sm font-medium hover:border-neon-purple/40 hover:text-neon-purple transition-colors"
          >
            {link.label}
            <ArrowRight className="h-3.5 w-3.5 opacity-60" aria-hidden />
          </Link>
        ))}
      </div>
    </nav>
  );

  if (contained) {
    return <div className="container mt-10">{nav}</div>;
  }

  return <div className="mt-10">{nav}</div>;
}
