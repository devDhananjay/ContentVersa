import { NextResponse } from "next/server";
import { mkdir, writeFile, chmod } from "fs/promises";
import { join, dirname } from "path";
import { z } from "zod";
import { requireSuperAdminApi } from "@/lib/auth/require-admin-api";
import { getFirebaseAdminCredentials } from "@/lib/firebase-admin-credentials";
import { getFirebaseAdminPushStatus } from "@/lib/notifications/push";

const BodySchema = z.object({
  credentials: z.record(z.unknown()),
});

const SECRETS_DIR =
  process.env.FIREBASE_SECRETS_DIR ||
  join(process.cwd(), "..", "secrets");
const CREDENTIALS_FILE = join(SECRETS_DIR, "firebase-admin.json");

export async function GET() {
  try {
    await requireSuperAdminApi();
    const status = getFirebaseAdminPushStatus();
    return NextResponse.json({
      ...status,
      credentialsFile: CREDENTIALS_FILE,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Super Admin only" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

/** Save Firebase service account JSON to server secrets file (not in git). */
export async function POST(req: Request) {
  try {
    await requireSuperAdminApi();
    const body = BodySchema.parse(await req.json());
    const creds = body.credentials as {
      type?: string;
      client_email?: string;
      private_key?: string;
      project_id?: string;
    };

    if (creds.type !== "service_account" || !creds.client_email || !creds.private_key) {
      return NextResponse.json(
        { error: "Invalid service account JSON (need type, client_email, private_key)" },
        { status: 400 }
      );
    }

    await mkdir(dirname(CREDENTIALS_FILE), { recursive: true });
    const json = JSON.stringify(creds);
    await writeFile(CREDENTIALS_FILE, json, { mode: 0o600 });
    await chmod(CREDENTIALS_FILE, 0o600);

    process.env.FIREBASE_ADMIN_CREDENTIALS = json;
    process.env.FIREBASE_ADMIN_CREDENTIALS_FILE = CREDENTIALS_FILE;

    const status = getFirebaseAdminPushStatus();
    const parsed = getFirebaseAdminCredentials();

    return NextResponse.json({
      ok: true,
      configured: status.configured,
      projectId: parsed?.project_id ?? creds.project_id,
      clientEmail: creds.client_email,
      message: "Server push credentials saved. Send a test notification to verify.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Super Admin only" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[admin firebase credentials]", err);
    return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });
  }
}
