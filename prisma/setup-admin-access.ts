/**
 * Ensure admin accounts exist and owner is SUPER_ADMIN.
 *
 *   npm run db:setup-admin
 *
 * Logins after running:
 *   • dhananjays124@gmail.com / password123  (owner + admin)
 *   • admin@contentverse.app / password123     (platform admin)
 */
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PLATFORM_OWNER_EMAIL } from "../lib/owner";

const prisma = new PrismaClient();
const ADMIN_PASSWORD = "password123";

async function upsertAdminUser(
  email: string,
  username: string,
  name: string,
  role: UserRole
) {
  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      username,
      name,
      password,
      role,
      emailVerified: new Date(),
      profile: { create: {} },
      wallet: { create: {} },
    },
    update: {
      password,
      role,
      name,
    },
  });
}

async function main() {
  console.log("→ Setting up admin access…\n");

  // Platform admin (email/password sign-in page)
  const platformAdmin = await upsertAdminUser(
    "admin@contentverse.app",
    "admin",
    "ContentVerse Admin",
    UserRole.SUPER_ADMIN
  );
  console.log(`✓ admin@contentverse.app → SUPER_ADMIN (password: ${ADMIN_PASSWORD})`);

  // Owner Google account — also allow email/password + admin role
  const owner = await prisma.user.findUnique({
    where: { email: PLATFORM_OWNER_EMAIL },
  });

  if (!owner) {
    console.log(
      `\n⚠ Owner ${PLATFORM_OWNER_EMAIL} not in DB yet.\n` +
        "  Sign in once with Google, then run: npm run db:setup-admin\n"
    );
  } else {
    const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const updated = await prisma.user.update({
      where: { id: owner.id },
      data: {
        role: UserRole.SUPER_ADMIN,
        password,
      },
    });
    console.log(
      `✓ ${updated.email} (@${updated.username}) → SUPER_ADMIN + password set (${ADMIN_PASSWORD})`
    );
  }

  const pending = await prisma.blog.count({ where: { status: "PENDING" } });
  console.log(`\n→ ${pending} blog(s) waiting in moderation queue.`);
  console.log("\nSign in at /auth/sign-in then open /admin/moderation");
  console.log(`\nDone. Platform admin id: ${platformAdmin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
