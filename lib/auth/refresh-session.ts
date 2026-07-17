import { signSession, setSessionCookie, type SessionUser } from "@/lib/auth";
import { resolveSessionRole } from "@/lib/auth/resolve-session-role";
import { resolveUserId } from "@/lib/auth/resolve-user-id";

/** Re-issue JWT when DB role or canonical user id differs from the cookie. */
export async function refreshSessionIfStale(session: SessionUser): Promise<SessionUser> {
  const role = await resolveSessionRole(session);
  const userId = await resolveUserId(session);
  const sub = userId || session.sub;

  if (role === session.role && sub === session.sub) {
    return session;
  }

  const refreshed: SessionUser = {
    ...session,
    role,
    sub,
  };

  const token = await signSession({
    sub: refreshed.sub,
    email: refreshed.email,
    username: refreshed.username,
    role: refreshed.role,
    name: refreshed.name,
    image: refreshed.image,
  });
  await setSessionCookie(token);
  return refreshed;
}
