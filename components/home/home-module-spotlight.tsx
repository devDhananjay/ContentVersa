import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ModuleSpotlightItem = {
  title: string;
  href: string;
  meta?: string;
  kicker?: string;
};

type HomeModuleSpotlightProps = {
  id: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  /** Kept for backwards compatibility; the editorial theme uses one accent. */
  accentClassName?: string;
  items?: ModuleSpotlightItem[];
  children?: ReactNode;
  /** Soft tinted band for rhythm between neighbouring sections. */
  tint?: boolean;
};

/** Compact “peek” into a module so every hub shows a bit on the homepage. */
export function HomeModuleSpotlight({
  id,
  eyebrow,
  title,
  description,
  href,
  cta,
  icon: Icon,
  items,
  children,
  tint = false,
}: HomeModuleSpotlightProps) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24", tint && "border-y border-border/60 bg-muted/40")}
    >
      <div className="container py-12 md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary sm:grid">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="v2-eyebrow">{eyebrow}</p>
              <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight md:text-4xl">
                {title}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
                {description}
              </p>
            </div>
          </div>
          <Link href={href} className="hidden sm:block">
            <Button variant="outline" size="sm" className="gap-2 rounded-full">
              {cta} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {children}

        {items?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <Link
                key={item.href + item.title}
                href={item.href}
                className="v2-raised v2-lift group relative flex min-h-[8rem] flex-col justify-between overflow-hidden p-5"
              >
                <div className="v2-aurora pointer-events-none opacity-40" aria-hidden />
                <div className="relative">
                  {item.kicker ? (
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
                      {item.kicker}
                    </p>
                  ) : null}
                  <p className="font-display text-lg font-semibold leading-snug tracking-tight">
                    {item.title}
                  </p>
                </div>
                <div className="relative mt-4 flex items-end justify-between gap-2">
                  {item.meta ? (
                    <p className="text-xs text-muted-foreground">{item.meta}</p>
                  ) : (
                    <span />
                  )}
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-6 sm:hidden">
          <Link href={href}>
            <Button variant="gradient" className="w-full gap-2">
              {cta} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
