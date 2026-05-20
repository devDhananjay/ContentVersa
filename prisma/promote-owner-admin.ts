/**
 * Grant SUPER_ADMIN to the platform owner (Google account).
 * Run: npm run db:promote-admin
 */
import { PrismaClient, UserRole } from "@prisma/client";
import { PLATFORM_OWNER_EMAIL } from "../lib/owner";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: PLATFORM_OWNER_EMAIL },
    data: { role: UserRole.SUPER_ADMIN },
  });
  console.log(`✓ ${user.name} (@${user.username}) is now SUPER_ADMIN`);
  console.log("  Open /admin/moderation after signing in with Google.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
