/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient, BlogStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORIES } from "../lib/data/categories";
import { BLOGS, AUTHORS } from "../lib/data/blogs";
import { readingTime, slugify } from "../lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ContentVerse…");

  // Wipe existing data (only safe in dev!)
  await prisma.bookmark.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.blogTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.adminReview.deleteMany();
  await prisma.submissionQueue.deleteMany();
  await prisma.analytics.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.category.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  console.log("→ Creating users…");
  const userMap: Record<string, string> = {};
  const password = await bcrypt.hash("password123", 10);
  for (const author of AUTHORS) {
    const user = await prisma.user.create({
      data: {
        email: `${author.username}@contentverse.app`,
        username: author.username,
        name: author.name,
        password,
        image: author.avatar,
        role: author.verified ? UserRole.VERIFIED_CREATOR : UserRole.USER,
        profile: {
          create: {
            bio: author.bio,
            isVerified: author.verified,
          },
        },
        wallet: { create: {} },
      },
    });
    userMap[author.username] = user.id;
  }

  await prisma.user.create({
    data: {
      email: "admin@contentverse.app",
      username: "admin",
      name: "ContentVerse Admin",
      password,
      role: UserRole.SUPER_ADMIN,
      profile: { create: { bio: "Platform admin." } },
      wallet: { create: {} },
    },
  });

  console.log("→ Creating categories…");
  const catMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const c = await prisma.category.create({
      data: {
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
    });
    catMap[cat.slug] = c.id;
  }

  console.log("→ Creating blogs…");
  for (const blog of BLOGS) {
    await prisma.blog.create({
      data: {
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
        authorId: userMap[blog.author.username],
        categoryId: catMap[blog.category],
      },
    });
  }

  console.log("✓ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
