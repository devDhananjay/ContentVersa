/**
 * Replace visible "TOI rewrite" tag with "ContentVerse" on Live News blogs.
 *   npx tsx scripts/retags-toi-contentverse.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

function loadEnvFiles() {
  for (const file of [".env", ".env.local"]) {
    const path = join(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (file === ".env.local" || !process.env[key]) process.env[key] = val;
    }
  }
}

loadEnvFiles();

async function main() {
  const prisma = new PrismaClient();
  const cv = await prisma.tag.upsert({
    where: { slug: "contentverse" },
    create: { name: "ContentVerse", slug: "contentverse" },
    update: { name: "ContentVerse" },
    select: { id: true },
  });

  const toiTags = await prisma.tag.findMany({
    where: {
      OR: [
        { slug: { contains: "toi-rewrite" } },
        { name: { equals: "TOI rewrite", mode: "insensitive" } },
        { name: { equals: "TOI Rewrite", mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, slug: true },
  });

  // Also catch slug variants
  const extra = await prisma.tag.findMany({
    where: { name: { contains: "TOI rewrite" } },
    select: { id: true, name: true, slug: true },
  });
  const byId = new Map<string, { id: string; name: string; slug: string }>();
  for (const t of [...toiTags, ...extra]) byId.set(t.id, t);
  const oldTags = [...byId.values()];

  console.log(
    JSON.stringify({
      contentverseTag: cv.id,
      oldTags: oldTags.map((t) => ({ name: t.name, slug: t.slug })),
    })
  );

  let replaced = 0;
  let added = 0;

  const blogs = await prisma.blog.findMany({
    where: { metaKeywords: { contains: "toi-rewrite" } },
    select: {
      id: true,
      slug: true,
      tags: { select: { tagId: true, tag: { select: { name: true, slug: true } } } },
    },
  });

  for (const blog of blogs) {
    const hasCv = blog.tags.some((t) => t.tagId === cv.id);
    const toiLinks = blog.tags.filter((t) =>
      oldTags.some((o) => o.id === t.tagId) ||
      /^toi[- ]?rewrite$/i.test(t.tag.name) ||
      /^toi[- ]?rewrite$/i.test(t.tag.slug)
    );

    if (toiLinks.length) {
      await prisma.blogTag.deleteMany({
        where: {
          blogId: blog.id,
          tagId: { in: toiLinks.map((t) => t.tagId) },
        },
      });
      replaced += toiLinks.length;
    }

    if (!hasCv) {
      await prisma.blogTag.upsert({
        where: { blogId_tagId: { blogId: blog.id, tagId: cv.id } },
        create: { blogId: blog.id, tagId: cv.id },
        update: {},
      });
      added++;
    }
  }

  // Fix blogCount roughly
  for (const old of oldTags) {
    const count = await prisma.blogTag.count({ where: { tagId: old.id } });
    await prisma.tag.update({
      where: { id: old.id },
      data: { blogCount: count },
    });
  }
  const cvCount = await prisma.blogTag.count({ where: { tagId: cv.id } });
  await prisma.tag.update({
    where: { id: cv.id },
    data: { blogCount: cvCount },
  });

  console.log(JSON.stringify({ blogs: blogs.length, replaced, added, cvCount }));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
