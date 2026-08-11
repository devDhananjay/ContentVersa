import { SignJWT, jwtVerify } from "jose";
import { headers } from "next/headers";
import { getCurrentUser, type SessionUser } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireUserId, resolveUserId } from "@/lib/auth/resolve-user-id";

const TOKEN_TTL = "365d";
const TOKEN_AUD = "jobpilot";

function secretKey() {
  const secret =
    process.env.JOBPILOT_JWT_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    "dev-secret-change-me-please-change-me-please";
  return new TextEncoder().encode(secret);
}

export type JobPilotTokenPayload = {
  sub: string;
  email: string;
  username: string;
  name?: string;
  aud: string;
};

export async function signJobPilotToken(user: {
  id: string;
  email: string;
  username: string;
  name?: string | null;
}): Promise<string> {
  return new SignJWT({
    email: user.email,
    username: user.username,
    name: user.name ?? undefined,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setAudience(TOKEN_AUD)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(secretKey());
}

export async function verifyJobPilotToken(
  token: string
): Promise<JobPilotTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      audience: TOKEN_AUD,
    });
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      sub: payload.sub,
      email: payload.email,
      username:
        typeof payload.username === "string" ? payload.username : "user",
      name: typeof payload.name === "string" ? payload.name : undefined,
      aud: TOKEN_AUD,
    };
  } catch {
    return null;
  }
}

/** Resolve JobPilot user from Bearer token OR ContentVerse session cookie. */
export async function requireJobPilotUser(): Promise<{
  userId: string;
  email: string;
  username: string;
  name: string | null;
}> {
  const hdrs = await headers();
  const auth = hdrs.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;

  if (bearer) {
    const payload = await verifyJobPilotToken(bearer);
    if (!payload) throw new Error("UNAUTHENTICATED");
    if (!isDatabaseConfigured()) {
      return {
        userId: payload.sub,
        email: payload.email,
        username: payload.username,
        name: payload.name ?? null,
      };
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, username: true, name: true, banned: true },
    });
    if (!user || user.banned) throw new Error("UNAUTHENTICATED");
    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    };
  }

  const session = await getCurrentUser();
  if (!session) throw new Error("UNAUTHENTICATED");
  const userId = await requireUserId(session);
  return {
    userId,
    email: session.email,
    username: session.username,
    name: session.name ?? null,
  };
}

export async function exchangeSessionForJobPilotToken(
  session: SessionUser
): Promise<string> {
  const userId = await resolveUserId(session);
  if (!userId) throw new Error("USER_NOT_FOUND");
  return signJobPilotToken({
    id: userId,
    email: session.email,
    username: session.username,
    name: session.name,
  });
}
