"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

export type FirebasePublicConfig = {
  configured: boolean;
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
  vapidKey: string;
};

let cached: FirebasePublicConfig | null = null;
let messagingApp: FirebaseApp | null = null;

export async function loadFirebasePublicConfig(): Promise<FirebasePublicConfig | null> {
  if (cached) return cached;
  try {
    const res = await fetch("/api/firebase/config", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as FirebasePublicConfig;
    if (!data.configured) return null;
    cached = data;
    return data;
  } catch {
    return null;
  }
}

export async function getFirebaseMessagingApp(): Promise<FirebaseApp | null> {
  const config = await loadFirebasePublicConfig();
  if (!config) return null;
  if (messagingApp) return messagingApp;
  const existing = getApps().find((a) => a.name === "messaging");
  if (existing) {
    messagingApp = existing;
    return messagingApp;
  }
  messagingApp = initializeApp(
    {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
      measurementId: config.measurementId || undefined,
    },
    "messaging"
  );
  return messagingApp;
}
