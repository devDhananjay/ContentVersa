"use client";

import { getFirebaseApp, isFirebaseConfigured } from "@/lib/firebase";

let messagingInit: Promise<string | null> | null = null;

/** Request browser notification permission and register FCM token. */
export async function registerFirebasePushToken(): Promise<string | null> {
  if (typeof window === "undefined" || !isFirebaseConfigured()) return null;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim();
  if (!vapidKey) return null;

  if (messagingInit) return messagingInit;

  messagingInit = (async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return null;

      const { getMessaging, getToken, isSupported } = await import(
        "firebase/messaging"
      );
      const supported = await isSupported();
      if (!supported) return null;

      const messaging = getMessaging(getFirebaseApp());
      const token = await getToken(messaging, { vapidKey });
      if (!token) return null;

      await fetch("/api/notifications/push-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token }),
      });

      return token;
    } catch (err) {
      console.warn("[fcm] registration skipped", err);
      return null;
    }
  })();

  return messagingInit;
}
