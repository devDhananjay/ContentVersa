/**
 * Seed dashboard data (notifications, bookmarks, wallet, revenue, achievements)
 * for the platform owner. Run after db:assign-owner.
 *
 *   npm run db:seed-dashboard
 */
import { PrismaClient, NotificationType, RevenueSource } from "@prisma/client";
import { PLATFORM_OWNER_EMAIL } from "../lib/owner";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  {
    code: "first-post",
    title: "First Post",
    description: "Published your first article on ContentVerse.",
    icon: "📝",
  },
  {
    code: "top-creator",
    title: "Top 5% Creator",
    description: "Ranked in the top 5% of creators this week.",
    icon: "🏆",
  },
  {
    code: "marathon",
    title: "Marathon Writer",
    description: "Maintained a 12-day writing streak.",
    icon: "🔥",
  },
  {
    code: "viral-hit",
    title: "Viral Hit",
    description: "A post crossed 100K views.",
    icon: "🚀",
  },
];

async function main() {
  const owner = await prisma.user.findUnique({
    where: { email: PLATFORM_OWNER_EMAIL },
    include: { profile: true, wallet: true },
  });

  if (!owner) {
    throw new Error(`Owner ${PLATFORM_OWNER_EMAIL} not found. Run db:assign-owner first.`);
  }

  const blogs = await prisma.blog.findMany({
    where: { authorId: owner.id, status: "PUBLISHED" },
    orderBy: { views: "desc" },
  });

  console.log(`→ Seeding dashboard data for @${owner.username} (${blogs.length} blogs)`);

  // Achievements catalog + owner earns them
  for (const a of ACHIEVEMENTS) {
    const achievement = await prisma.achievement.upsert({
      where: { code: a.code },
      create: a,
      update: { title: a.title, description: a.description, icon: a.icon },
    });
    await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId: owner.id,
          achievementId: achievement.id,
        },
      },
      create: { userId: owner.id, achievementId: achievement.id },
      update: {},
    });
  }

  // Wallet balance from content performance
  const totalViews = blogs.reduce((s, b) => s + b.views, 0);
  const totalLikes = blogs.reduce((s, b) => s + b.likesCount, 0);
  const estimatedEarnings = Math.round(totalViews * 0.01 + totalLikes * 0.05);

  await prisma.wallet.upsert({
    where: { userId: owner.id },
    create: {
      userId: owner.id,
      balance: estimatedEarnings,
      payoutEmail: owner.email,
    },
    update: {
      balance: estimatedEarnings,
      payoutEmail: owner.email,
    },
  });

  await prisma.profile.update({
    where: { userId: owner.id },
    data: {
      totalViews,
      totalLikes,
      totalEarning: estimatedEarnings,
      streakDays: 12,
    },
  });

  // Revenue history (owner only)
  await prisma.revenue.deleteMany({ where: { userId: owner.id } });
  const revenueRows: { source: RevenueSource; amount: number; daysAgo: number }[] = [
    { source: "SUBSCRIPTION", amount: estimatedEarnings * 0.45, daysAgo: 0 },
    { source: "ADS", amount: estimatedEarnings * 0.3, daysAgo: 5 },
    { source: "SPONSORED", amount: estimatedEarnings * 0.17, daysAgo: 12 },
    { source: "TIP", amount: estimatedEarnings * 0.08, daysAgo: 20 },
  ];
  for (const r of revenueRows) {
    const d = new Date();
    d.setDate(d.getDate() - r.daysAgo);
    await prisma.revenue.create({
      data: {
        userId: owner.id,
        source: r.source,
        amount: Math.round(r.amount * 100) / 100,
        createdAt: d,
      },
    });
  }

  // Notifications (owner only — about their own content)
  await prisma.notification.deleteMany({ where: { userId: owner.id } });
  const topBlog = blogs[0];
  if (topBlog) {
    await prisma.notification.createMany({
      data: [
        {
          userId: owner.id,
          type: NotificationType.APPROVAL,
          title: "Your blog was approved",
          message: `“${topBlog.title}” is now live on ContentVerse.`,
          read: false,
        },
        {
          userId: owner.id,
          type: NotificationType.LIKE,
          title: `${formatK(totalLikes)} new reactions`,
          message: `Your posts are getting engagement across the platform.`,
          read: false,
        },
        {
          userId: owner.id,
          type: NotificationType.SYSTEM,
          title: "Achievement unlocked",
          message: "Top 5% creator this week — keep shipping!",
          read: false,
        },
        {
          userId: owner.id,
          type: NotificationType.COMMENT,
          title: "New comment on your post",
          message: "A reader left feedback on your latest article.",
          read: true,
        },
        {
          userId: owner.id,
          type: NotificationType.PAYOUT,
          title: "Payout processed",
          message: `$${estimatedEarnings.toLocaleString()} sent to your payout email.`,
          read: true,
        },
      ],
    });
  }

  // Bookmarks — owner saves their own top posts
  await prisma.bookmark.deleteMany({ where: { userId: owner.id } });
  for (const blog of blogs.slice(0, 6)) {
    await prisma.bookmark.upsert({
      where: { blogId_userId: { blogId: blog.id, userId: owner.id } },
      create: { blogId: blog.id, userId: owner.id },
      update: {},
    });
  }

  // Analytics per blog
  for (const blog of blogs) {
    await prisma.analytics.upsert({
      where: { blogId: blog.id },
      create: {
        blogId: blog.id,
        uniqueVisitors: Math.round(blog.views * 0.7),
        avgReadTime: blog.readingTime * 60,
        bounceRate: 0.23,
        ctr: 0.084,
        topReferrer: "Google Search",
      },
      update: {
        uniqueVisitors: Math.round(blog.views * 0.7),
        avgReadTime: blog.readingTime * 60,
      },
    });
  }

  console.log(`✓ Dashboard seed complete for ${owner.name}.`);
  console.log(`  Wallet: $${estimatedEarnings} · Views: ${totalViews.toLocaleString()} · Notifications: 5`);
}

function formatK(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
