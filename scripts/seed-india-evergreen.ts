#!/usr/bin/env npx tsx
/**
 * Seed India evergreen guide drafts (title-based slugs, quality outlines).
 * Usage: npx tsx scripts/seed-india-evergreen.ts
 */
import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { PLATFORM_OWNER_EMAIL } from "../lib/owner";
import { INDIA_EVERGREEN_GUIDES } from "../lib/seo/india-evergreen-guides";
import { CATEGORIES } from "../lib/data/categories";
import { readingTime, slugify } from "../lib/utils";

function buildContent(g: (typeof INDIA_EVERGREEN_GUIDES)[0]) {
  const toolLine = g.relatedToolHref
    ? `\n\nTry the free tool: [${g.relatedToolHref}](${g.relatedToolHref})\n`
    : "";
  const sections = g.outline
    .map(
      (h, i) =>
        `## ${h}\n\nThis section covers ${h.toLowerCase()} for Indian readers. Add local examples, current year figures, and clear next steps. Educational only — not financial advice.\n`
    )
    .join("\n");
  return `# ${g.title}\n\n${g.searchIntent}.${toolLine}\n${sections}\n## Key takeaways\n\n- Use official sources for legal or tax actions.\n- Cross-check numbers with our free tools when linked.\n- Share this guide on WhatsApp if it helped someone in your family.\n`;
}

async function main() {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL missing");
  const owner = await prisma.user.findUnique({
    where: { email: PLATFORM_OWNER_EMAIL },
    select: { id: true },
  });
  if (!owner) throw new Error(`Owner ${PLATFORM_OWNER_EMAIL} not found`);

  let created = 0;
  let skipped = 0;

  for (const g of INDIA_EVERGREEN_GUIDES) {
    const exists = await prisma.blog.findUnique({
      where: { slug: g.slug },
      select: { id: true },
    });
    if (exists) {
      skipped++;
      continue;
    }
    const def = CATEGORIES.find((c) => c.slug === g.categorySlug);
    const category = await prisma.category.upsert({
      where: { slug: g.categorySlug },
      create: {
        name: def?.name ?? g.categorySlug,
        slug: g.categorySlug,
        description: def?.description,
      },
      update: {},
      select: { id: true },
    });
    const content = buildContent(g);
    await prisma.blog.create({
      data: {
        title: g.title,
        slug: g.slug,
        excerpt: g.searchIntent,
        content,
        readingTime: readingTime(content),
        status: BlogStatus.DRAFT,
        metaTitle: g.title,
        metaDescription: g.searchIntent.slice(0, 155),
        metaKeywords: `india, ${g.categorySlug}, evergreen, ${slugify(g.title)}`,
        authorId: owner.id,
        categoryId: category.id,
      },
    });
    created++;
    console.log("created", g.slug);
  }

  console.log(JSON.stringify({ created, skipped }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
