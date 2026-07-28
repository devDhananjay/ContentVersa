"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** After ~70% scroll, nudge reader to the next recommended article. */
export function NextUpPrompt({
  next,
}: {
  next: { slug: string; title: string } | null;
}) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!next) return;
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? (el.scrollTop / max) * 100 : 0;
      setShow(pct >= 70);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [next]);

  if (!next || !show) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 md:bottom-6 right-4 z-40 max-w-xs",
        "rounded-2xl border border-border/60 bg-card/95 p-4 shadow-xl backdrop-blur"
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-neon-cyan">
        Next up
      </p>
      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">
        {next.title}
      </p>
      <Link
        href={`/blog/${next.slug}`}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-neon-purple hover:underline"
      >
        Continue reading
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
