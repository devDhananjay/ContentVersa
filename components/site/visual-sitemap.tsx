import type { ComponentType, CSSProperties } from "react";
import Link from "next/link";
import {
  Home,
  BookOpen,
  PenLine,
  Clapperboard,
  Trophy,
  LineChart,
  Briefcase,
  User,
  Shield,
  LayoutGrid,
  ExternalLink,
} from "lucide-react";
import {
  SITE_MAP_ADMIN,
  SITE_MAP_FOOTER,
  SITE_MAP_MODULES,
  SITE_MAP_NAV,
  type SiteMapItem,
  type SiteMapModule,
} from "@/lib/data/site-map-tree";
import { cn } from "@/lib/utils";

const MODULE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  home: Home,
  reading: BookOpen,
  creators: PenLine,
  reels: Clapperboard,
  sports: Trophy,
  finance: LineChart,
  jobs: Briefcase,
  account: User,
  admin: Shield,
  footer: LayoutGrid,
};

const COLOR_STYLES: Record<
  SiteMapModule["color"],
  { dot: string; border: string; header: string; line: string; badge: string; svg: string }
> = {
  rose: {
    dot: "bg-rose-500",
    border: "border-rose-500/40",
    header: "from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-400",
    line: "border-rose-400/60",
    badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    svg: "rgba(244,63,94,0.55)",
  },
  violet: {
    dot: "bg-violet-500",
    border: "border-violet-500/40",
    header: "from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400",
    line: "border-violet-400/60",
    badge: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    svg: "rgba(139,92,246,0.55)",
  },
  sky: {
    dot: "bg-sky-500",
    border: "border-sky-500/40",
    header: "from-sky-500/20 to-sky-500/5 text-sky-600 dark:text-sky-400",
    line: "border-sky-400/60",
    badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    svg: "rgba(14,165,233,0.55)",
  },
  amber: {
    dot: "bg-amber-500",
    border: "border-amber-500/40",
    header: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
    line: "border-amber-400/60",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    svg: "rgba(245,158,11,0.55)",
  },
  emerald: {
    dot: "bg-emerald-500",
    border: "border-emerald-500/40",
    header: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    line: "border-emerald-400/60",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    svg: "rgba(16,185,129,0.55)",
  },
  orange: {
    dot: "bg-orange-500",
    border: "border-orange-500/40",
    header: "from-orange-500/20 to-orange-500/5 text-orange-600 dark:text-orange-400",
    line: "border-orange-400/60",
    badge: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    svg: "rgba(249,115,22,0.55)",
  },
  fuchsia: {
    dot: "bg-fuchsia-500",
    border: "border-fuchsia-500/40",
    header: "from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-600 dark:text-fuchsia-400",
    line: "border-fuchsia-400/60",
    badge: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
    svg: "rgba(217,70,239,0.55)",
  },
  slate: {
    dot: "bg-slate-500",
    border: "border-slate-500/40",
    header: "from-slate-500/20 to-slate-500/5 text-slate-600 dark:text-slate-400",
    line: "border-slate-400/60",
    badge: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
    svg: "rgba(100,116,139,0.55)",
  },
  red: {
    dot: "bg-red-500",
    border: "border-red-500/40",
    header: "from-red-500/20 to-red-500/5 text-red-600 dark:text-red-400",
    line: "border-red-400/60",
    badge: "bg-red-500/15 text-red-600 dark:text-red-400",
    svg: "rgba(239,68,68,0.55)",
  },
};

function TreeList({
  children,
  treeColor,
  className,
}: {
  children: React.ReactNode;
  treeColor: string;
  className?: string;
}) {
  return (
    <ul
      className={cn("sitemap-tree-trunk list-none", className)}
      style={{ "--tree-line-color": treeColor } as CSSProperties}
    >
      {children}
    </ul>
  );
}

function TreeItem({
  item,
  treeColor,
  isFirst = true,
  isLast = true,
}: {
  item: SiteMapItem;
  treeColor: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const hasChildren = Boolean(item.children?.length);

  const label = item.href ? (
    <Link
      href={item.href}
      className="text-sm font-medium text-foreground hover:text-neon-purple transition-colors min-w-0"
    >
      {item.label}
    </Link>
  ) : (
    <span className="text-sm font-medium text-foreground">{item.label}</span>
  );

  return (
    <li
      className="sitemap-tree-item list-none"
      style={{ "--tree-line-color": treeColor } as CSSProperties}
    >
      {isFirst && (
        <span aria-hidden className="absolute left-0 top-0 z-[1] h-4 w-0.5 bg-card pointer-events-none" />
      )}
      {isLast && (
        <span
          aria-hidden
          className="absolute left-0 top-4 bottom-0 z-[1] w-0.5 bg-card pointer-events-none"
        />
      )}

      <div className="relative z-[2] flex items-center py-1.5 min-w-0">{label}</div>

      {item.detail && (
        <p className="relative z-[2] mt-0.5 pb-1 text-xs text-muted-foreground leading-relaxed pr-1">
          {item.detail}
        </p>
      )}

      {hasChildren && (
        <TreeList treeColor={treeColor} className="ml-1">
          {item.children!.map((child, i) => (
            <TreeItem
              key={`${child.label}-${i}`}
              item={child}
              treeColor={treeColor}
              isFirst={i === 0}
              isLast={i === item.children!.length - 1}
            />
          ))}
        </TreeList>
      )}
    </li>
  );
}

function ModuleCard({
  module,
  showConnector = true,
}: {
  module: SiteMapModule;
  showConnector?: boolean;
}) {
  const styles = COLOR_STYLES[module.color];
  const Icon = MODULE_ICONS[module.id] ?? LayoutGrid;

  return (
    <div className="flex flex-col items-stretch min-w-0 h-full">
      {showConnector && (
        <div className="flex flex-col items-center shrink-0">
          <div className={cn("h-10 w-0 border-l-2 border-dashed", styles.line)} />
        </div>
      )}

      <article
        className={cn(
          "flex-1 rounded-2xl border-2 border-dashed bg-card shadow-sm overflow-hidden",
          styles.border
        )}
      >
        <header
          className={cn(
            "px-4 py-3.5 bg-gradient-to-r border-b-2 border-dashed border-border/40",
            styles.header
          )}
        >
          <div className="flex items-start gap-2.5">
            <span className={cn("mt-1.5 h-2.5 w-2.5 rounded-full shrink-0", styles.dot)} />
            <Icon className="h-4 w-4 shrink-0 mt-0.5 opacity-80" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {module.href ? (
                  <Link href={module.href} className="font-bold text-base hover:underline">
                    {module.label}
                  </Link>
                ) : (
                  <span className="font-bold text-base">{module.label}</span>
                )}
                {module.tag && (
                  <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full", styles.badge)}>
                    {module.tag}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs opacity-90 leading-relaxed">{module.summary}</p>
            </div>
          </div>
        </header>

        <div className="px-3 py-3 space-y-4">
          {module.groups.map((group) => (
            <div key={group.heading}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 px-2">
                {group.heading}
              </p>
              <TreeList treeColor={styles.svg}>
                {group.items.map((item, i) => (
                  <TreeItem
                    key={`${group.heading}-${item.label}`}
                    item={item}
                    treeColor={styles.svg}
                    isFirst={i === 0}
                    isLast={i === group.items.length - 1}
                  />
                ))}
              </TreeList>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function NavToModulesBridge() {
  return (
    <div className="hidden lg:flex flex-col items-center pointer-events-none" aria-hidden>
      <div className="h-6 w-px border-l-2 border-dashed border-border/60" />
      <div className="h-px w-full max-w-4xl border-t-2 border-dashed border-border/60" />
    </div>
  );
}

function SectionConnector({ label, colorClass }: { label: string; colorClass?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className={cn("h-8 w-0 border-l-2 border-dashed border-border/70")} />
      <div className="flex items-center gap-3 w-full">
        <div className={cn("h-px flex-1 border-t-2 border-dashed", colorClass ?? "border-border/60")} />
        <p className={cn("text-xs font-bold uppercase tracking-widest shrink-0", colorClass ? "text-red-500/80" : "text-muted-foreground")}>
          {label}
        </p>
        <div className={cn("h-px flex-1 border-t-2 border-dashed", colorClass ?? "border-border/60")} />
      </div>
      <div className={cn("h-6 w-0 border-l-2 border-dashed", colorClass ?? "border-border/70")} />
    </div>
  );
}

export function VisualSitemap() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground leading-relaxed max-w-3xl">
        Complete architecture map — dotted lines show how navigation connects to modules,
        pages, sub-features, and admin tools. Every box is clickable where a live page exists.
      </p>

      {/* ─── NAV + modules (connected) ─── */}
      <div className="flex flex-col items-stretch gap-0">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-3xl rounded-2xl border-2 border-dashed border-neon-purple/50 bg-neon-purple/10 px-6 py-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neon-purple text-center mb-2">
            NAV · Global header
          </p>
          <div className="text-center">
            <Link href={SITE_MAP_NAV.href} className="font-display text-2xl font-extrabold hover:underline">
              {SITE_MAP_NAV.label}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">{SITE_MAP_NAV.summary}</p>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {SITE_MAP_NAV.links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="rounded-md border border-dashed border-border/70 bg-background/80 px-2.5 py-1 text-xs hover:border-neon-purple/50 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {SITE_MAP_NAV.actions.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="rounded-lg border-2 border-dashed border-neon-purple/30 bg-neon-purple/5 px-3 py-1.5 text-xs font-semibold hover:bg-neon-purple/15 transition-colors"
              >
                {a.label}
              </Link>
            ))}
          </div>
          </div>
        </div>

        <NavToModulesBridge />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-6 w-full -mt-px">
          {SITE_MAP_MODULES.map((mod) => (
            <ModuleCard key={mod.id} module={mod} showConnector={false} />
          ))}
        </div>
      </div>

      {/* ─── Admin ─── */}
      <SectionConnector label="Admin Panel · Staff only" colorClass="border-red-400/40" />
      <div className="max-w-5xl mx-auto w-full">
        <ModuleCard module={SITE_MAP_ADMIN} showConnector={false} />
      </div>

      {/* ─── Footer ─── */}
      <SectionConnector label="Footer · Every page" />
      <div className="rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 overflow-hidden">
        <div className="px-5 py-4 border-b border-dashed border-border/50">
          <p className="font-semibold text-sm">{SITE_MAP_FOOTER.label}</p>
          <p className="text-xs text-muted-foreground mt-1">{SITE_MAP_FOOTER.summary}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
          {SITE_MAP_FOOTER.columns.map((col) => (
            <div key={col.heading}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                {col.heading}
              </p>
              <ul className="space-y-1.5">
                {col.items.map((item) => (
                  <li key={item.label} className="relative pl-3">
                    <span
                      aria-hidden
                      className="absolute left-0 top-[0.55rem] w-2 border-t border-dashed border-border"
                    />
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-dashed border-border/50 text-xs text-muted-foreground text-center">
          Visitor count · Social links · © ContentVerse
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-5 py-4 text-sm text-muted-foreground flex flex-wrap items-center gap-2">
        <span>Machine-readable SEO sitemap:</span>
        <Link href="/sitemap.xml" className="inline-flex items-center gap-1 text-foreground hover:underline font-medium">
          /sitemap.xml
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
