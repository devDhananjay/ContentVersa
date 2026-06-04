import { readFileSync, existsSync } from "fs";
import { join } from "path";

export type FirebaseAdminCreds = {
  client_email: string;
  private_key: string;
  project_id?: string;
};

const DEFAULT_FILE =
  process.env.FIREBASE_ADMIN_CREDENTIALS_FILE ||
  join(process.cwd(), "..", "secrets", "firebase-admin.json");

/** Load service account JSON from env string or secrets file. */
export function loadFirebaseAdminCredentialsJson(): string | null {
  const fromEnv = process.env.FIREBASE_ADMIN_CREDENTIALS?.trim();
  if (fromEnv && fromEnv !== '""' && fromEnv !== "''") {
    return fromEnv;
  }

  const filePath = DEFAULT_FILE;
  if (!existsSync(filePath)) return null;

  try {
    return readFileSync(filePath, "utf8").trim();
  } catch {
    return null;
  }
}

export function parseFirebaseAdminCredentials(
  raw: string | null
): FirebaseAdminCreds | null {
  if (!raw) return null;
  try {
    const creds = JSON.parse(raw) as FirebaseAdminCreds;
    if (creds.client_email && creds.private_key) return creds;
  } catch {
    return null;
  }
  return null;
}

export function getFirebaseAdminCredentials(): FirebaseAdminCreds | null {
  return parseFirebaseAdminCredentials(loadFirebaseAdminCredentialsJson());
}
