"use client";

import * as React from "react";
import { useSession } from "@/components/auth/use-session";
import { registerFirebasePushToken } from "@/lib/firebase-messaging";

const PROMPT_KEY = "cv_notif_prompted";

/**
 * On site open (logged-in user): request notification permission if not set yet.
 * If already granted, register silently — no extra popup/banner.
 */
export function AutoPushPermission() {
  const { user, loading } = useSession();

  React.useEffect(() => {
    if (loading || !user) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const run = async () => {
      const permission = Notification.permission;

      if (permission === "granted") {
        await registerFirebasePushToken({ askPermission: false });
        return;
      }

      if (permission === "denied") {
        return;
      }

      // default — native prompt once per tab session when site opens
      if (sessionStorage.getItem(PROMPT_KEY) === "1") return;
      sessionStorage.setItem(PROMPT_KEY, "1");

      await registerFirebasePushToken({ askPermission: true });
    };

    const t = window.setTimeout(run, 800);
    return () => window.clearTimeout(t);
  }, [user, loading]);

  return null;
}
