"use client";

import * as React from "react";
import { useSession } from "@/components/auth/use-session";
import { isFirebaseConfigured } from "@/lib/firebase";
import { registerFirebasePushToken } from "@/lib/firebase-messaging";

/** Registers FCM when user is signed in (dashboard / app shell). */
export function FcmRegister() {
  const { user } = useSession();

  React.useEffect(() => {
    if (!user || !isFirebaseConfigured()) return;
    if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) return;

    const key = `cv_fcm_registered_${user.username}`;
    if (sessionStorage.getItem(key)) return;

    registerFirebasePushToken().then((token) => {
      if (token) sessionStorage.setItem(key, "1");
    });
  }, [user]);

  return null;
}
