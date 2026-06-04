"use client";

import { getFirebaseApp, isFirebaseConfigured } from "@/lib/firebase";

type PushResult = { token: string | null; error?: string };
let messagingInit: Promise<PushResult> | null = null;

export function resetPushRegistration() {
  messagingInit = null;
}

/** Request browser notification permission and register FCM token (needs user gesture in Safari). */
export async function registerFirebasePushToken(): Promise<{
  token: string | null;
  error?: string;
}> {
  if (typeof window === "undefined" || !isFirebaseConfigured()) {
    return { token: null, error: "Firebase is not configured." };
  }
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return { token: null, error: "This browser does not support push notifications." };
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim();
  if (!vapidKey) {
    return { token: null, error: "VAPID key is missing on the server." };
  }

  resetPushRegistration();

  messagingInit = (async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return {
          token: null,
          error:
            permission === "denied"
              ? "Notifications blocked. Enable them in Safari → Settings → Websites → Notifications."
              : "Notification permission was not granted.",
        };
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" }
      );
      await navigator.serviceWorker.ready;

      const { getMessaging, getToken, isSupported } = await import(
        "firebase/messaging"
      );
      const supported = await isSupported();
      if (!supported) {
        return { token: null, error: "Firebase Messaging is not supported in this browser." };
      }

      const messaging = getMessaging(getFirebaseApp());
      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });
      if (!token) {
        return { token: null, error: "Could not get FCM token. Check Firebase Cloud Messaging setup." };
      }

      const res = await fetch("/api/notifications/push-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        return { token: null, error: "Failed to save push token on server." };
      }

      return { token };
    } catch (err) {
      console.warn("[fcm] registration failed", err);
      return {
        token: null,
        error: err instanceof Error ? err.message : "Push registration failed.",
      };
    }
  })();

  return messagingInit;
}
