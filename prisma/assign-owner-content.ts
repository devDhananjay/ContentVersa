/**
 * Assign all mock/seed blog content to the platform owner account.
 * Run after signing in once with Google (so the user exists in DB).
 *
 *   npm run db:assign-owner
 */
import { PrismaClient, BlogStatus, UserRole } from "@prisma/client";
import { CATEGORIES } from "../lib/data/categories";
import { BLOGS } from "../lib/data/blogs";
import { PLATFORM_OWNER_EMAIL } from "../lib/owner";
import { readingTime, slugify } from "../lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log(`Looking up owner: ${PLATFORM_OWNER_EMAIL}`);

  const owner = await prisma.user.findUnique({
    where: { email: PLATFORM_OWNER_EMAIL },
    include: { profile: true },
  });

  if (!owner) {
    throw new Error(
      `User ${PLATFORM_OWNER_EMAIL} not found. Sign in with Google first, then run this script again.`
    );
  }

  console.log(`→ Owner: ${owner.name} (@${owner.username})`);

  await prisma.user.update({
    where: { id: owner.id },
    data: { role: UserRole.SUPER_ADMIN },
  });

  const totalViews = BLOGS.reduce((s, b) => s + b.views, 0);
  const totalLikes = BLOGS.reduce((s, b) => s + b.likes, 0);

  await prisma.profile.upsert({
    where: { userId: owner.id },
    create: {
      userId: owner.id,
      bio: "Creator on ContentVerse. Building, writing, and shipping in public.",
      headline: "Verified creator",
      isVerified: true,
      totalViews,
      totalLikes,
    },
    update: {
      bio: "Creator on ContentVerse. Building, writing, and shipping in public.",
      headline: "Verified creator",
      isVerified: true,
      totalViews,
      totalLikes,
    },
  });

  await prisma.wallet.upsert({
    where: { userId: owner.id },
    create: { userId: owner.id },
    update: {},
  });

  console.log("→ Upserting categories…");
  const catMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        banner: cat.banner,
        icon: cat.icon,
        color: cat.color,
        subcategories: {
          create: cat.subcategories.map((s) => ({
            name: s,
            slug: slugify(`${cat.slug}-${s}`),
          })),
        },
      },
      update: {
        name: cat.name,
        description: cat.description,
        banner: cat.banner,
        icon: cat.icon,
        color: cat.color,
      },
    });
    catMap[cat.slug] = row.id;
  }

  console.log(`→ Assigning ${BLOGS.length} blogs to @${owner.username}…`);
  let created = 0;
  let updated = 0;

  for (const blog of BLOGS) {
    const existing = await prisma.blog.findUnique({ where: { slug: blog.slug } });
    const data = {
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      coverImage: blog.coverImage,
      readingTime: readingTime(blog.content),
      status: BlogStatus.PUBLISHED,
      isFeatured: !!blog.featured,
      isEditorPick: !!blog.editorPick,
      isPremium: !!blog.premium,
      views: blog.views,
      likesCount: blog.likes,
      commentsCount: blog.comments,
      publishedAt: new Date(blog.publishedAt),
      authorId: owner.id,
      categoryId: catMap[blog.category] ?? null,
    };

    if (existing) {
      await prisma.blog.update({ where: { slug: blog.slug }, data });
      updated++;
    } else {
      await prisma.blog.create({ data });
      created++;
    }
  }

  const publishedCount = await prisma.blog.count({
    where: { authorId: owner.id, status: BlogStatus.PUBLISHED },
  });

  console.log(`✓ Done. Created ${created}, updated ${updated}.`);
  console.log(`✓ ${publishedCount} published posts now belong to ${owner.name} (@${owner.username}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
