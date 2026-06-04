/**
 * Firebase Cloud Messaging (optional).
 * Requires service account JSON (FIREBASE_ADMIN_CREDENTIALS or secrets file).
 * Browser registration uses NEXT_PUBLIC_FIREBASE_VAPID_KEY.
 */

import {
  getFirebaseAdminCredentials,
  loadFirebaseAdminCredentialsJson,
} from "@/lib/firebase-admin-credentials";

type PushPayload = {
  title: string;
  body: string;
  link?: string;
};

let warnedNoCredentials = false;

/** Why server-side FCM send is unavailable (empty env, bad JSON, etc.). */
export function getFirebaseAdminPushStatus(): {
  configured: boolean;
  reason?: "missing" | "empty" | "invalid_json" | "incomplete";
  source?: "env" | "file";
} {
  const fromEnv = process.env.FIREBASE_ADMIN_CREDENTIALS?.trim();
  if (fromEnv && fromEnv !== '""' && fromEnv !== "''") {
    const creds = getFirebaseAdminCredentials();
    if (creds) return { configured: true, source: "env" };
    try {
      JSON.parse(fromEnv);
      return { configured: false, reason: "incomplete", source: "env" };
    } catch {
      return { configured: false, reason: "invalid_json", source: "env" };
    }
  }

  const raw = loadFirebaseAdminCredentialsJson();
  if (!raw) return { configured: false, reason: "missing" };
  const creds = getFirebaseAdminCredentials();
  if (creds) return { configured: true, source: "file" };
  try {
    JSON.parse(raw);
    return { configured: false, reason: "incomplete", source: "file" };
  } catch {
    return { configured: false, reason: "invalid_json", source: "file" };
  }
}

async function getAccessToken(): Promise<string | null> {
  const creds = getFirebaseAdminCredentials();
  if (!creds) return null;

  try {
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(
      JSON.stringify({ alg: "RS256", typ: "JWT" })
    ).toString("base64url");
    const claim = Buffer.from(
      JSON.stringify({
        iss: creds.client_email,
        sub: creds.client_email,
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
      })
    ).toString("base64url");

    const crypto = await import("crypto");
    const signInput = `${header}.${claim}`;
    const signature = crypto
      .createSign("RSA-SHA256")
      .update(signInput)
      .sign(creds.private_key.replace(/\\n/g, "\n"), "base64url");

    const jwt = `${signInput}.${signature}`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    return tokenJson.access_token ?? null;
  } catch (err) {
    console.error("[fcm] token error", err);
    return null;
  }
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const { prisma, isDatabaseConfigured } = await import("@/lib/prisma");
  if (!isDatabaseConfigured()) return;

  const tokens = await prisma.pushToken.findMany({
    where: { userId },
    select: { token: true },
  });
  if (tokens.length === 0) return;

  const accessToken = await getAccessToken();
  if (!accessToken) {
    if (!warnedNoCredentials) {
      warnedNoCredentials = true;
      console.warn(
        "[fcm] Firebase admin credentials missing — in-app notifications still work; push disabled."
      );
    }
    return;
  }

  const creds = getFirebaseAdminCredentials();
  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || creds?.project_id;
  if (!projectId) return;

  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  for (const { token } of tokens) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            webpush: payload.link
              ? {
                  fcmOptions: { link: payload.link },
                }
              : undefined,
          },
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error("[fcm] send failed", res.status, errText.slice(0, 200));
      }
    } catch (err) {
      console.error("[fcm] send failed", err);
    }
  }
}
