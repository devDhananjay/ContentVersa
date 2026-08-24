import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  TOPIC_CLUSTERS,
  getTopicClusterLinks,
  type TopicCluster,
} from "@/lib/seo/topic-clusters";

/** Crawlable internal links for a hand-curated topic cluster. */
export function TopicClusterLinks({
  cluster,
  currentHref,
  heading = "In this topic",
}: {
  cluster: TopicCluster;
  currentHref?: string;
  heading?: string;
}) {
  const links = getTopicClusterLinks(cluster, currentHref);
  if (!links.length) return null;

  return (
    <section className="max-w-3xl space-y-3 rounded-2xl border bg-card/40 p-5">
      <div className="space-y-1">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {heading}: {cluster.title}
        </h2>
        <p className="text-sm text-muted-foreground">{cluster.description}</p>
      </div>
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href={cluster.pillarHref}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
          >
            {cluster.pillarLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </li>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Compact strip of all clusters — for hubs like /guides and /tools. */
export function TopicClustersHubStrip({
  title = "Topic clusters",
  subtitle = "Hand-picked pillars with tools, guides, and related reading — not doorway pages.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">{subtitle}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOPIC_CLUSTERS.map((c) => (
          <Link
            key={c.id}
            href={c.pillarHref}
            className="rounded-2xl border bg-card/50 p-4 transition-colors hover:border-primary/40 hover:bg-card"
          >
            <p className="font-display font-semibold text-sm">{c.title}</p>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {c.description}
            </p>
            <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
              Open pillar <ArrowRight className="h-3 w-3" />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
