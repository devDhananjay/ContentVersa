// JWT-based auth using `jose`. Sessions stored in HTTP-only cookies.
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me-please-change-me-please"
);
const SESSION_COOKIE = "cv_session";
const SESSION_TTL = 60 * 60 * 24 * 365; // 1 year — stay signed in

export interface SessionUser extends JWTPayload {
  sub: string;
  email: string;
  username: string;
  role:
    | "GUEST"
    | "USER"
    | "VERIFIED_CREATOR"
    | "MODERATOR"
    | "ADMIN"
    | "SUPER_ADMIN";
  name?: string;
  image?: string;
}

export async function signSession(user: Omit<SessionUser, "iat" | "exp">) {
  return await new SignJWT(user as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL}s`)
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as SessionUser;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireRole(
  roles: SessionUser["role"][]
): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
