import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { unlockAchievement } from "@/lib/engagement/achievements";
import { createUserNotification } from "@/lib/notifications/create";
import { NotificationType } from "@prisma/client";
import { getAppUrl } from "@/lib/app-url";

function randomCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function ensureReferralCode(userId: string): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { referralCode: true },
  });
  if (profile?.referralCode) return profile.referralCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    try {
      await prisma.profile.update({
        where: { userId },
        data: { referralCode: code },
      });
      return code;
    } catch {
      /* collision — retry */
    }
  }
  return null;
}

export function referralSignupUrl(code: string) {
  return `${getAppUrl()}/auth/sign-up?ref=${encodeURIComponent(code)}`;
}

/** Apply referral on signup — both users get streak bonus notification */
export async function applyReferralOnSignup(
  newUserId: string,
  referralCode?: string | null
) {
  if (!isDatabaseConfigured() || !referralCode?.trim()) return;

  const referrer = await prisma.profile.findFirst({
    where: { referralCode: referralCode.trim().toUpperCase() },
    select: { userId: true },
  });
  if (!referrer || referrer.userId === newUserId) return;

  await prisma.profile.update({
    where: { userId: newUserId },
    data: { referredByUserId: referrer.userId },
  });

  const bonusDays = 1;
  for (const uid of [newUserId, referrer.userId]) {
    const profile = await prisma.profile.findUnique({
      where: { userId: uid },
      select: { streakDays: true, longestStreak: true },
    });
    if (!profile) continue;
    const next = profile.streakDays + bonusDays;
    await prisma.profile.update({
      where: { userId: uid },
      data: {
        streakDays: next,
        longestStreak: Math.max(profile.longestStreak, next),
      },
    });
  }

  await unlockAchievement(referrer.userId, "referral-bonus");

  await createUserNotification({
    userId: referrer.userId,
    type: NotificationType.SYSTEM,
    title: "Referral bonus!",
    message: "A friend joined via your invite — +1 streak day for both of you.",
    link: "/dashboard",
  });

  await createUserNotification({
    userId: newUserId,
    type: NotificationType.SYSTEM,
    title: "Welcome bonus!",
    message: "You joined via a friend's invite — +1 streak day to start.",
    link: "/dashboard",
  });
}
