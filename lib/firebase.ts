// Client-side Firebase initialization.
//
// Used (for now) by the upcoming "Phone OTP" sign-in flow. We deliberately
// keep this module side-effect-free at import time and lazy-init Firebase
// only when something actually asks for an app instance, so:
//   - Pages that don't use Firebase pay no bundle/runtime cost.
//   - Importing this module on the server doesn't crash when the
//     NEXT_PUBLIC_FIREBASE_* env vars are blank.
//
// SETUP (one time, in Firebase Console):
//   1. https://console.firebase.google.com → "Add project"
//   2. Project settings → "Your apps" → register a Web app → copy the config.
//   3. Paste the values into .env (NEXT_PUBLIC_FIREBASE_*) and restart `npm run dev`.
//   4. Build → Authentication → Sign-in method → enable "Phone".
//   5. Authentication → Settings → Authorized domains → add `localhost`
//      and your production domain.

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import type { Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _analytics: Analytics | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* values to .env and restart the dev server."
    );
  }
  if (_app) return _app;
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}

/**
 * Lazily initialise Firebase Analytics. Returns `null` outside the browser
 * or when analytics isn't supported (e.g. SSR, no measurementId).
 *
 * Usage from a client component / `useEffect`:
 *   useEffect(() => { getFirebaseAnalytics(); }, []);
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.measurementId) return null;
  if (_analytics) return _analytics;

  const { getAnalytics, isSupported } = await import("firebase/analytics");
  if (!(await isSupported())) return null;
  _analytics = getAnalytics(getFirebaseApp());
  return _analytics;
}
