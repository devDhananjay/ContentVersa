"use client";

import * as React from "react";
import { Loader2, Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BlogOption = {
  id: string;
  slug: string;
  title: string;
};

type Props = {
  value: string | null;
  initialBlog?: { slug: string; title: string } | null;
  onChange: (blogId: string | null, meta?: { slug: string; title: string }) => void;
  className?: string;
};

export function RelatedBlogPicker({ value, initialBlog, onChange, className }: Props) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<BlogOption[]>([]);
  const [selected, setSelected] = React.useState<BlogOption | null>(
    initialBlog && value ? { id: value, slug: initialBlog.slug, title: initialBlog.title } : null
  );
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (initialBlog && value) {
      setSelected({ id: value, slug: initialBlog.slug, title: initialBlog.title });
    } else if (!value) {
      setSelected(null);
    }
  }, [value, initialBlog?.slug, initialBlog?.title]);

  React.useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const t = setTimeout(() => {
      setLoading(true);
      fetch(`/api/blogs?q=${encodeURIComponent(query.trim())}&limit=8`)
        .then((r) => r.json())
        .then((d: { data?: BlogOption[] }) => setResults(d.data ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(t);
  }, [query, open]);

  const pick = (blog: BlogOption) => {
    setSelected(blog);
    onChange(blog.id, { slug: blog.slug, title: blog.title });
    setOpen(false);
    setQuery("");
  };

  const clear = () => {
    setSelected(null);
    onChange(null);
    setQuery("");
    setResults([]);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Related article (optional)</Label>
      <p className="text-xs text-muted-foreground">
        Link a blog post — viewers can jump from your reel to the full article.
      </p>

      {selected ? (
        <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
          <span className="text-sm flex-1 truncate">{selected.title}</span>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={clear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search published articles…"
            className="pl-9"
          />
          {open && query.trim().length >= 2 ? (
            <div className="absolute z-20 mt-1 w-full rounded-xl border bg-popover shadow-lg max-h-48 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : results.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3">No articles found</p>
              ) : (
                results.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 truncate"
                    onClick={() => pick(b)}
                  >
                    {b.title}
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
