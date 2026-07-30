"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

/** Full /api/auth/me payload (JWT fields + optional profile extras). */
export type SessionMeUser = SessionUser & {
  profile?: {
    bio?: string | null;
    headline?: string | null;
    website?: string | null;
    twitter?: string | null;
    isVerified?: boolean;
    totalViews?: number;
    totalLikes?: number;
  } | null;
  payoutEmail?: string | null;
  currency?: string | null;
  reading?: {
    totalSeconds: number;
    totalFormatted: string;
    articlesRead: number;
  } | null;
};

type SessionContextValue = {
  user: SessionMeUser | null;
  loading: boolean;
  isSignedIn: boolean;
  /** Re-fetch /api/auth/me and update all consumers. */
  refresh: () => Promise<void>;
  /** Instantly patch shared session (e.g. after profile save). */
  applyUser: (next: Partial<SessionMeUser> | SessionMeUser | null) => void;
};

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = React.useState<SessionMeUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json()) as { user: SessionMeUser | null };
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyUser = React.useCallback(
    (next: Partial<SessionMeUser> | SessionMeUser | null) => {
      if (next === null) {
        setUser(null);
        return;
      }
      setUser((prev) => {
        if (!prev) return next as SessionMeUser;
        return {
          ...prev,
          ...next,
          profile:
            next.profile !== undefined
              ? { ...(prev.profile ?? {}), ...(next.profile ?? {}) }
              : prev.profile,
        };
      });
    },
    []
  );

  React.useEffect(() => {
    void refresh();
  }, [pathname, refresh]);

  React.useEffect(() => {
    const onRefresh = () => {
      void refresh();
    };
    window.addEventListener("cv:session-refresh", onRefresh);
    return () => window.removeEventListener("cv:session-refresh", onRefresh);
  }, [refresh]);

  const value = React.useMemo(
    () => ({
      user,
      loading,
      isSignedIn: Boolean(user),
      refresh,
      applyUser,
    }),
    [user, loading, refresh, applyUser]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = React.useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
