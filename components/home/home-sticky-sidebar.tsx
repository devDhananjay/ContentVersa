"use client";

import * as React from "react";
import {
  Briefcase,
  Clapperboard,
  Compass,
  Flame,
  Gem,
  Home,
  LayoutGrid,
  Mail,
  Medal,
  Newspaper,
  TrendingUp,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type HomeNavSection = {
  id: string;
  label: string;
  icon?: LucideIcon;
};

const SECTION_ICONS: Record<string, LucideIcon> = {
  "home-top": Home,
  "explore-modules": LayoutGrid,
  "home-sports": Medal,
  "home-finance": TrendingUp,
  "home-money": Wallet,
  "home-gold": Gem,
  "home-tools": Wrench,
  "home-jobs": Briefcase,
  "home-cine": Clapperboard,
  "home-articles": Flame,
  "home-latest": Newspaper,
  newsletter: Mail,
};

type HomeStickySidebarProps = {
  sections: HomeNavSection[];
};

/**
 * Slim left sticky rail — only appears after the modules marquee scrolls past,
 * so it sits below that strip instead of overlapping hero/modules.
 */
export function HomeStickySidebar({ sections }: HomeStickySidebarProps) {
  const [activeId, setActiveId] = React.useState(sections[0]?.id ?? "");
  const [pastModules, setPastModules] = React.useState(false);

  React.useEffect(() => {
    const rail = document.getElementById("home-modules-rail");
    if (!rail) return;

    const update = () => {
      // Show once the modules marquee has scrolled off the top of the viewport
      setPastModules(rail.getBoundingClientRect().bottom <= 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  React.useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-18% 0px -58% 0px",
        threshold: [0.08, 0.2, 0.45],
      }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  function goTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }

  return (
    <aside
      aria-label="Page sections"
      aria-hidden={!pastModules}
      className={cn(
        "pointer-events-none fixed left-0 z-40 hidden w-14 xl:block",
        "top-[calc(var(--site-header-offset,4rem)+0.75rem)]",
        "transition-opacity duration-300",
        pastModules ? "opacity-100" : "opacity-0"
      )}
    >
      <nav
        className={cn(
          "pointer-events-auto relative mx-auto flex w-11 flex-col items-center gap-0.5 rounded-2xl border border-white/12 bg-background/85 py-2 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.6)] backdrop-blur-xl",
          !pastModules && "pointer-events-none"
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 left-1/2 top-3 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/25 to-transparent"
        />

        {sections.map((section) => {
          const active = activeId === section.id;
          const Icon = section.icon || SECTION_ICONS[section.id] || Compass;

          return (
            <div key={section.id} className="group relative flex w-full justify-center px-1">
              <button
                type="button"
                onClick={() => goTo(section.id)}
                tabIndex={pastModules ? 0 : -1}
                className={cn(
                  "relative z-[1] flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
                  active
                    ? "bg-neon-cyan/15 text-neon-cyan"
                    : "text-muted-foreground hover:bg-white/8 hover:text-foreground"
                )}
                aria-label={section.label}
                aria-current={active ? "true" : undefined}
                title={section.label}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    active && "scale-110 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                  )}
                />
              </button>

              <span
                className={cn(
                  "pointer-events-none absolute left-[calc(100%+0.35rem)] top-1/2 z-10 flex -translate-y-1/2 items-center gap-2 rounded-lg border border-white/10 bg-background/95 px-2.5 py-1.5 shadow-lg backdrop-blur-md transition-all duration-200",
                  active
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    active ? "text-neon-cyan" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "whitespace-nowrap text-[11px] font-semibold tracking-wide",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {section.label}
                </span>
              </span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
