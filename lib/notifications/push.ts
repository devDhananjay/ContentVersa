/**
 * Firebase Cloud Messaging (optional).
 * Requires FIREBASE_ADMIN_CREDENTIALS (service account JSON) on the server.
 * Browser registration uses NEXT_PUBLIC_FIREBASE_VAPID_KEY.
 */

type PushPayload = {
  title: string;
  body: string;
  link?: string;
};

let warnedNoCredentials = false;

async function getAccessToken(): Promise<string | null> {
  const raw = process.env.FIREBASE_ADMIN_CREDENTIALS?.trim();
  if (!raw) return null;

  try {
    const creds = JSON.parse(raw) as {
      client_email: string;
      private_key: string;
      project_id?: string;
    };
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
        "[fcm] FIREBASE_ADMIN_CREDENTIALS not set — in-app notifications still work; push disabled."
      );
    }
    return;
  }

  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    (() => {
      try {
        return JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS || "{}")
          .project_id;
      } catch {
        return null;
      }
    })();

  if (!projectId) return;

  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  for (const { token } of tokens) {
    try {
      await fetch(url, {
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
    } catch (err) {
      console.error("[fcm] send failed", err);
    }
  }
}
