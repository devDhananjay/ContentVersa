// Verify a Firebase Authentication ID token without depending on the
// `firebase-admin` package. We use the public JWKS that Firebase publishes
// for the Secure Token service — same keys `firebase-admin` checks against
// internally — and `jose` (already a runtime dep) for verification.

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

// JWKS calls are cached internally by `jose`; safe to keep a module singleton.
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

export interface FirebasePhonePayload extends JWTPayload {
  /** Firebase UID. */
  sub: string;
  /** E.164 phone number (e.g. "+919876543210"). Present for phone-auth users. */
  phone_number?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  firebase?: {
    sign_in_provider?: string;
    identities?: Record<string, string[]>;
  };
}

/**
 * Verify a Firebase ID token. Throws on invalid signature / expiry / issuer.
 */
export async function verifyFirebaseIdToken(token: string): Promise<FirebasePhonePayload> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set; cannot verify Firebase ID tokens."
    );
  }

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ["RS256"],
  });

  if (!payload.sub) {
    throw new Error("Firebase ID token missing `sub`.");
  }

  return payload as FirebasePhonePayload;
}
