import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { signSession, setSessionCookie } from "@/lib/auth";
import {
  verifyFirebaseIdToken,
  type FirebasePhonePayload,
} from "@/lib/auth/firebase-verify";

export const runtime = "nodejs";

const Body = z.object({
  idToken: z.string().min(20),
});

/** Derive a unique-ish username for a phone-only user. */
function deriveUsername(payload: FirebasePhonePayload) {
  const fromName = (payload.name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  const fromPhone = (payload.phone_number || "").replace(/\D/g, "").slice(-6);
  const base = fromName || (fromPhone ? `u${fromPhone}` : "user");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base.slice(0, 20)}-${suffix}`;
}

/** Phone users don't have a real email; build a stable placeholder. */
function placeholderEmail(payload: FirebasePhonePayload) {
  if (payload.email) return payload.email;
  const local = (payload.phone_number || payload.sub).replace(/[^a-zA-Z0-9]/g, "");
  return `${local}@phone.contentverse.local`;
}

export async function POST(req: Request) {
  let body: { idToken: string };
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Missing or invalid `idToken`." }, { status: 400 });
  }

  let payload: FirebasePhonePayload;
  try {
    payload = await verifyFirebaseIdToken(body.idToken);
  } catch (err) {
    console.error("[firebase-auth] verify failed", err);
    return NextResponse.json(
      { error: "Invalid Firebase ID token." },
      { status: 401 }
    );
  }

  const phone = payload.phone_number || null;
  const provider = phone ? "PHONE_OTP" : "EMAIL_OTP";

  if (isDatabaseConfigured()) {
    try {
      const upserted = await prisma.$transaction(async (tx) => {
        // 1. Find by phone (preferred) → email → none.
        let user =
          (phone ? await tx.user.findUnique({ where: { phone } }) : null) ??
          (payload.email
            ? await tx.user.findUnique({ where: { email: payload.email } })
            : null);

        if (!user) {
          // 2. Generate a unique username (small retry loop).
          let username = deriveUsername(payload);
          for (let i = 0; i < 5; i++) {
            const clash = await tx.user.findUnique({ where: { username } });
            if (!clash) break;
            username = deriveUsername(payload);
          }

          user = await tx.user.create({
            data: {
              email: placeholderEmail(payload),
              username,
              name: payload.name || null,
              image: payload.picture || null,
              phone: phone || undefined,
              phoneVerified: phone ? new Date() : null,
              emailVerified: payload.email_verified ? new Date() : null,
              profile: { create: {} },
              wallet: { create: {} },
              accounts: {
                create: {
                  provider,
                  providerAccountId: payload.sub,
                },
              },
            },
          });
          return { user, isNew: true as const };
        } else {
          // 3. Existing user → backfill phone + verification, link Firebase account.
          await tx.account.upsert({
            where: {
              provider_providerAccountId: {
                provider,
                providerAccountId: payload.sub,
              },
            },
            create: {
              userId: user.id,
              provider,
              providerAccountId: payload.sub,
            },
            update: {},
          });
          await tx.profile.upsert({
            where: { userId: user.id },
            create: { userId: user.id },
            update: {},
          });
          await tx.wallet.upsert({
            where: { userId: user.id },
            create: { userId: user.id },
            update: {},
          });
          if (phone && !user.phone) {
            user = await tx.user.update({
              where: { id: user.id },
              data: {
                phone,
                phoneVerified: new Date(),
              },
            });
          }
          return { user, isNew: false as const };
        }
      });

      if (upserted.isNew) {
        const { welcomeNewUser } = await import("@/lib/notifications/welcome-user");
        void welcomeNewUser({
          userId: upserted.user.id,
          email: upserted.user.email,
          name: upserted.user.name,
        });
      }

      const token = await signSession({
        sub: upserted.user.id,
        email: upserted.user.email,
        username: upserted.user.username,
        role: upserted.user.role as
          | "USER"
          | "ADMIN"
          | "MODERATOR"
          | "VERIFIED_CREATOR"
          | "SUPER_ADMIN"
          | "GUEST",
        name: upserted.user.name || undefined,
        image: upserted.user.image || undefined,
      });
      await setSessionCookie(token);
      return NextResponse.json({
        ok: true,
        user: {
          id: upserted.user.id,
          username: upserted.user.username,
          name: upserted.user.name,
          phone: upserted.user.phone,
        },
      });
    } catch (err) {
      console.error("[firebase-auth] DB upsert failed, falling back to JWT-only", err);
      // fall through
    }
  }

  // Demo / no-DB fallback — sign in via JWT cookie only.
  const token = await signSession({
    sub: `firebase:${payload.sub}`,
    email: placeholderEmail(payload),
    username: deriveUsername(payload),
    role: "USER",
    name: payload.name || undefined,
    image: payload.picture || undefined,
  });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, demo: true });
}
