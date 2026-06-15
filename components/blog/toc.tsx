"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ items }: { items: TOCItem[] }) {
  const [activeId, setActiveId] = React.useState<string | null>(items[0]?.id ?? null);
  const listRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  React.useEffect(() => {
    if (!activeId || !listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-toc-id="${activeId}"]`);
    activeEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);

  if (!items.length) return null;

  return (
    <nav className="text-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        On this page
      </p>
      <ul ref={listRef} className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              data-toc-id={item.id}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className={cn(
                "block py-1 border-l-2 pl-3 transition-colors",
                activeId === item.id
                  ? "border-neon-purple text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground",
                item.level === 3 && "pl-6"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
