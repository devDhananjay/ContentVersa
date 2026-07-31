"use client";

import * as React from "react";
import { useSession } from "@/components/auth/use-session";

type BookmarkStatusContextValue = {
  ready: boolean;
  isBookmarked: (ref: string) => boolean;
  setBookmarked: (ref: string, value: boolean) => void;
};

const BookmarkStatusContext = React.createContext<BookmarkStatusContextValue | null>(
  null
);

export function BookmarkStatusProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: sessionLoading } = useSession();
  const [refs, setRefs] = React.useState<Set<string>>(() => new Set());
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (sessionLoading) return;

    if (!user) {
      setRefs(new Set());
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);

    fetch("/api/me/bookmarks", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: { slugs?: string[]; ids?: string[] }) => {
        if (cancelled) return;
        const next = new Set<string>();
        for (const s of data.slugs ?? []) next.add(s);
        for (const id of data.ids ?? []) next.add(id);
        setRefs(next);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setRefs(new Set());
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, sessionLoading]);

  const isBookmarked = React.useCallback((ref: string) => refs.has(ref), [refs]);

  const setBookmarked = React.useCallback((ref: string, value: boolean) => {
    setRefs((prev) => {
      const next = new Set(prev);
      if (value) next.add(ref);
      else next.delete(ref);
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({ ready, isBookmarked, setBookmarked }),
    [ready, isBookmarked, setBookmarked]
  );

  return (
    <BookmarkStatusContext.Provider value={value}>
      {children}
    </BookmarkStatusContext.Provider>
  );
}

export function useBookmarkStatus() {
  return React.useContext(BookmarkStatusContext);
}
