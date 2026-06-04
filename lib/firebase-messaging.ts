"use client";

import {
  getFirebaseMessagingApp,
  loadFirebasePublicConfig,
} from "@/lib/firebase-config-client";

type PushResult = { token: string | null; error?: string };
let messagingInit: Promise<PushResult> | null = null;

export function resetPushRegistration() {
  messagingInit = null;
}

/**
 * Register FCM push token.
 * - permission already "granted": no browser prompt, silent register
 * - permission "default": shows native allow/deny (call on site open)
 * - permission "denied": returns without prompting
 */
export async function registerFirebasePushToken(options?: {
  askPermission?: boolean;
}): Promise<PushResult> {
  if (typeof window === "undefined") {
    return { token: null, error: "Not in browser." };
  }
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return { token: null, error: "Push not supported in this browser." };
  }

  const config = await loadFirebasePublicConfig();
  if (!config?.vapidKey) {
    return { token: null, error: "Firebase push is not configured on the server." };
  }

  const askPermission = options?.askPermission !== false;
  let permission = Notification.permission;

  if (permission === "denied") {
    return { token: null, error: "denied" };
  }

  if (permission === "default" && askPermission) {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return {
      token: null,
      error: permission === "denied" ? "denied" : "not-granted",
    };
  }

  if (messagingInit) return messagingInit;

  messagingInit = (async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" }
      );
      await navigator.serviceWorker.ready;

      const app = await getFirebaseMessagingApp();
      if (!app) {
        return { token: null, error: "Firebase app failed to initialize." };
      }

      const { getMessaging, getToken, isSupported } = await import(
        "firebase/messaging"
      );
      if (!(await isSupported())) {
        return { token: null, error: "Firebase Messaging not supported here." };
      }

      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: config.vapidKey,
        serviceWorkerRegistration: registration,
      });
      if (!token) {
        return { token: null, error: "Could not obtain FCM token." };
      }

      const res = await fetch("/api/notifications/push-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        return { token: null, error: "Failed to save token." };
      }

      return { token };
    } catch (err) {
      console.warn("[fcm]", err);
      return {
        token: null,
        error: err instanceof Error ? err.message : "Registration failed.",
      };
    } finally {
      messagingInit = null;
    }
  })();

  return messagingInit;
}
