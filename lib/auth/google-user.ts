import { prisma } from "@/lib/prisma";
import { deriveUsername, type GoogleProfile } from "@/lib/auth/google";

function googleDisplayName(profile: GoogleProfile) {
  return profile.name || profile.given_name || null;
}

/**
 * Link or create a Google user without a long interactive transaction
 * (Neon cold starts were exceeding Prisma's 5s default).
 */
export async function persistGoogleUser(profile: GoogleProfile) {
  const displayName = googleDisplayName(profile);
  const displayImage = profile.picture || null;

  let user = await prisma.user.findUnique({ where: { email: profile.email } });

  if (!user) {
    let username = deriveUsername(profile);
    for (let i = 0; i < 5; i++) {
      const taken = await prisma.user.findUnique({ where: { username } });
      if (!taken) break;
      username = deriveUsername(profile);
    }

    return prisma.user.create({
      data: {
        email: profile.email,
        username,
        name: displayName,
        image: displayImage,
        emailVerified: profile.verified_email ? new Date() : null,
        profile: { create: {} },
        wallet: { create: {} },
        accounts: {
          create: {
            provider: "GOOGLE",
            providerAccountId: profile.id,
          },
        },
      },
    });
  }

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "GOOGLE",
        providerAccountId: profile.id,
      },
    },
    create: {
      userId: user.id,
      provider: "GOOGLE",
      providerAccountId: profile.id,
    },
    update: {},
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  await prisma.wallet.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  return prisma.user.update({
    where: { id: user.id },
    data: {
      name: displayName ?? user.name,
      image: displayImage ?? user.image,
      emailVerified:
        user.emailVerified ?? (profile.verified_email ? new Date() : null),
    },
  });
}
