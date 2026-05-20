"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type BookmarkButtonProps = {
  /** Blog slug (preferred) or Prisma id — must match `/api/blogs/[slug]/bookmark` */
  blogRef: string;
  initialBookmarked?: boolean;
  className?: string;
  iconClassName?: string;
  showLabel?: boolean;
};

export function BookmarkButton({
  blogRef,
  initialBookmarked = false,
  className,
  iconClassName,
  showLabel,
}: BookmarkButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = React.useState(initialBookmarked);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/blogs/${encodeURIComponent(blogRef)}/bookmark`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: { bookmarked?: boolean }) => {
        if (!cancelled && typeof data.bookmarked === "boolean") {
          setSaved(data.bookmarked);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [blogRef]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(blogRef)}/bookmark`, {
        method: "POST",
      });
      const data = (await res.json()) as { bookmarked?: boolean; error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/auth/sign-in?next=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        throw new Error(data.error || "Could not bookmark");
      }
      setSaved(!!data.bookmarked);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bookmark failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={cn(
        "flex items-center justify-center transition-colors disabled:opacity-50",
        saved ? "text-neon-cyan" : "text-muted-foreground hover:text-foreground",
        className
      )}
      aria-label={saved ? "Remove bookmark" : "Bookmark"}
      aria-pressed={saved}
    >
      {loading ? (
        <Loader2 className={cn("h-4 w-4 animate-spin", iconClassName)} />
      ) : (
        <Bookmark className={cn("h-4 w-4", saved && "fill-current", iconClassName)} />
      )}
      {showLabel && (
        <span className="text-[10px] font-semibold ml-1">{saved ? "Saved" : "Save"}</span>
      )}
    </button>
  );
}
