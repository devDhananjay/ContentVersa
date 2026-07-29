import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  GUIDE_SECTIONS,
  getGuidesBySection,
  guideArticlePath,
  guideSectionPath,
  type GuideSection,
} from "@/lib/guides/registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function GuidesSectionGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {GUIDE_SECTIONS.map((section) => (
        <GuideSectionCard key={section.slug} section={section} />
      ))}
    </div>
  );
}

export function GuideSectionCard({ section }: { section: GuideSection }) {
  const guides = getGuidesBySection(section.slug).slice(0, 2);
  return (
    <Link
      href={guideSectionPath(section.slug)}
      className="group flex flex-col rounded-2xl border border-border/60 bg-card/60 p-5 transition hover:border-foreground/20 hover:bg-card"
    >
      <Badge variant="neon" className="w-fit">
        {section.badge}
      </Badge>
      <h3 className="mt-3 font-display text-lg font-bold tracking-tight group-hover:text-primary">
        {section.shortTitle}
      </h3>
      <p className="mt-1 text-xs font-medium text-muted-foreground">
        {section.template}
      </p>
      <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
        {section.description}
      </p>
      <ul className="mt-4 space-y-1.5 border-t border-border/50 pt-3">
        {guides.map((g) => (
          <li key={g.slug} className="truncate text-xs text-foreground/80">
            {g.shortTitle}
          </li>
        ))}
      </ul>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Open section <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

export function GuideArticleList({ section }: { section: GuideSection }) {
  const guides = getGuidesBySection(section.slug);
  return (
    <div className="grid gap-3">
      {guides.map((guide) => (
        <Link
          key={guide.slug}
          href={guideArticlePath(guide)}
          className="rounded-2xl border border-border/60 bg-card/70 p-5 transition hover:border-foreground/20 hover:bg-card"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{guide.readingMinutes} min read</Badge>
            <span className="text-xs text-muted-foreground">
              Updated {guide.updatedLabel}
            </span>
          </div>
          <h3 className="mt-2 font-display text-lg font-bold tracking-tight">
            {guide.title}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {guide.description}
          </p>
        </Link>
      ))}
    </div>
  );
}

export function GuideRelatedHub({ section }: { section: GuideSection }) {
  if (!section.relatedHub) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div>
        <p className="text-sm font-semibold">Related live hub</p>
        <p className="text-sm text-muted-foreground">
          Jump to fresh listings and tools for this topic.
        </p>
      </div>
      <Link href={section.relatedHub.href}>
        <Button size="sm" className="gap-2">
          {section.relatedHub.label} <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
