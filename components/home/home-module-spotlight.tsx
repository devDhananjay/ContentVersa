import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ModuleSpotlightItem = {
  title: string;
  href: string;
  meta?: string;
};

type HomeModuleSpotlightProps = {
  id: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  accentClassName?: string;
  items?: ModuleSpotlightItem[];
  children?: ReactNode;
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
  accentClassName = "text-neon-cyan",
  items,
  children,
}: HomeModuleSpotlightProps) {
  return (
    <section id={id} className="container scroll-mt-24 py-10 md:py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="neon" className={cn("mb-2 gap-1", accentClassName)}>
            <Icon className="h-3 w-3" />
            {eyebrow}
          </Badge>
          <h2 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
            {title}
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{description}</p>
        </div>
        <Link href={href} className="hidden sm:block">
          <Button variant="outline" size="sm" className="gap-2">
            {cta} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {children}

      {items?.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-border/60 bg-card/70 p-4 transition hover:border-foreground/20 hover:bg-card"
            >
              <p className="font-semibold leading-snug">{item.title}</p>
              {item.meta ? (
                <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
              ) : null}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-5 sm:hidden">
        <Link href={href}>
          <Button variant="gradient" className="w-full gap-2">
            {cta} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
