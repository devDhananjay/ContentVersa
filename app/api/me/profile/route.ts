import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, signSession, setSessionCookie } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name is too long")
    .optional(),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username is too long")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only use letters, numbers, _ and -"
    )
    .optional(),
  bio: z.string().trim().max(500, "Bio must be under 500 characters").nullable().optional(),
  website: z
    .string()
    .trim()
    .max(200)
    .nullable()
    .optional()
    .refine((v) => {
      if (v == null || v === "") return true;
      return /^https?:\/\//i.test(v);
    }, "Website must start with http:// or https://"),
  twitter: z.string().trim().max(80).nullable().optional(),
  image: z.string().trim().max(500).nullable().optional(),
  payoutEmail: z
    .union([z.string().trim().email("Invalid payout email"), z.literal(""), z.null()])
    .optional(),
  currency: z.enum(["INR", "USD"]).optional(),
});

function normalizeTwitter(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (!t) return null;
  return t.replace(/^@/, "").replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, "");
}

function normalizeWebsite(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (!t) return null;
  return t;
}

export async function PATCH(req: Request) {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const json = await req.json();
    const data = BodySchema.parse(json);

    if (data.username) {
      const taken = await prisma.user.findFirst({
        where: {
          username: { equals: data.username, mode: "insensitive" },
          NOT: { id: userId },
        },
        select: { id: true },
      });
      if (taken) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        );
      }
    }

    const website = normalizeWebsite(data.website);
    const twitter = normalizeTwitter(data.twitter);
    const bio = data.bio === undefined ? undefined : data.bio || null;
    const image =
      data.image === undefined ? undefined : data.image?.trim() || null;
    const payoutEmail =
      data.payoutEmail === undefined
        ? undefined
        : data.payoutEmail?.trim() || null;

    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.username !== undefined ? { username: data.username } : {}),
          ...(image !== undefined ? { image } : {}),
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          image: true,
          role: true,
        },
      }),
      prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          bio: bio ?? null,
          website,
          twitter,
        },
        update: {
          ...(bio !== undefined ? { bio } : {}),
          ...(data.website !== undefined ? { website } : {}),
          ...(data.twitter !== undefined ? { twitter } : {}),
        },
      }),
      prisma.wallet.upsert({
        where: { userId },
        create: {
          userId,
          ...(payoutEmail !== undefined ? { payoutEmail } : {}),
          ...(data.currency ? { currency: data.currency } : {}),
        },
        update: {
          ...(payoutEmail !== undefined ? { payoutEmail } : {}),
          ...(data.currency ? { currency: data.currency } : {}),
        },
      }),
    ]);

    const token = await signSession({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role as
        | "GUEST"
        | "USER"
        | "VERIFIED_CREATOR"
        | "MODERATOR"
        | "ADMIN"
        | "SUPER_ADMIN",
      name: user.name || undefined,
      image: user.image || undefined,
    });
    await setSessionCookie(token);

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        bio: true,
        website: true,
        twitter: true,
        headline: true,
        isVerified: true,
      },
    });
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { payoutEmail: true, currency: true },
    });

    return NextResponse.json({
      ok: true,
      user: {
        ...user,
        profile,
        payoutEmail: wallet?.payoutEmail ?? null,
        currency: wallet?.currency ?? "INR",
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[me/profile]", err);
    return NextResponse.json(
      { error: "Could not save profile" },
      { status: 500 }
    );
  }
}
