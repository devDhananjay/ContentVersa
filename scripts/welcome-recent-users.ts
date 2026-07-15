/**
 * Send welcome (email + in-app) to recent / listed users who never got one.
 *
 *   npx tsx scripts/welcome-recent-users.ts
 *   npx tsx scripts/welcome-recent-users.ts --days=14
 *   npx tsx scripts/welcome-recent-users.ts --emails=a@x.com,b@y.com
 */
import { PrismaClient } from "@prisma/client";
import { loadScriptEnv } from "./load-script-env";
import { welcomeNewUser, WELCOME_NOTIF_TITLE } from "../lib/notifications/welcome-user";
import { NotificationType } from "@prisma/client";

loadScriptEnv();

const prisma = new PrismaClient();

function parseArgs() {
  const daysArg = process.argv.find((a) => a.startsWith("--days="));
  const emailsArg = process.argv.find((a) => a.startsWith("--emails="));
  const forceEmail = process.argv.includes("--force-email");
  return {
    days: daysArg ? Number(daysArg.split("=")[1]) : 14,
    forceEmail,
    emails: emailsArg
      ? emailsArg
          .split("=")[1]
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean)
      : null,
  };
}

async function main() {
  const { days, emails, forceEmail } = parseArgs();
  const since = new Date(Date.now() - days * 86400000);

  const users = await prisma.user.findMany({
    where: emails?.length
      ? { email: { in: emails, mode: "insensitive" } }
      : {
          createdAt: { gte: since },
          role: "USER",
          NOT: { email: { endsWith: "@phone.contentverse.local" } },
        },
    select: { id: true, email: true, name: true, username: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  console.log(`Candidates: ${users.length}${forceEmail ? " (force-email)" : ""}`);

  let welcomed = 0;
  let skipped = 0;
  let emailed = 0;

  for (const u of users) {
    if (!forceEmail) {
      const already = await prisma.notification.findFirst({
        where: {
          userId: u.id,
          type: NotificationType.SYSTEM,
          title: WELCOME_NOTIF_TITLE,
        },
        select: { id: true },
      });
      if (already) {
        skipped++;
        console.log(`skip (already): ${u.email}`);
        continue;
      }
    }

    const result = await welcomeNewUser({
      userId: u.id,
      email: u.email,
      name: u.name,
      forceEmail,
    });
    if (result.notified) welcomed++;
    if (result.emailed) emailed++;
    console.log(
      `${result.emailed || result.notified ? "✓" : "✗"} ${u.email} notified=${result.notified} emailed=${result.emailed}`
    );
  }

  console.log(`\nDone: ${welcomed} newly notified, ${emailed} emails, ${skipped} skipped.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
