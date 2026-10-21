/**
 * Replace full-frame red TOI logo placeholders with /news-brand-cover.jpg
 *
 *   npx tsx scripts/replace-toi-logo-covers.ts
 *   npx tsx scripts/replace-toi-logo-covers.ts --limit=200
 */
import { PrismaClient } from "@prisma/client";
import { loadScriptEnv } from "./load-script-env";
import {
  cleanToiImageUrl,
  isToiCdnUrl,
  NEWS_BRAND_COVER,
  isContentVerseBrandCover,
} from "../lib/seo/toi-cover-url";
import { isToiBrandPlaceholder } from "../lib/seo/toi-cover";

loadScriptEnv();

const prisma = new PrismaClient();

async function main() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) || 200 : 300;

  const blogs = await prisma.blog.findMany({
    where: {
      metaKeywords: { contains: "toi-rewrite" },
      coverImage: { not: null },
    },
    select: { id: true, slug: true, coverImage: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  let replaced = 0;
  let scanned = 0;

  for (const b of blogs) {
    const raw = b.coverImage?.trim();
    if (!raw || isContentVerseBrandCover(raw)) continue;
    if (!isToiCdnUrl(raw) && !raw.includes("overlay-toi")) continue;

    scanned++;
    const url = cleanToiImageUrl(raw);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "ContentVerseIndiaBot/1.0 (+https://contentverse.co.in; cover sanitize)",
          Accept: "image/*,*/*",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(18_000),
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (!(await isToiBrandPlaceholder(buf))) continue;

      await prisma.blog.update({
        where: { id: b.id },
        data: { coverImage: NEWS_BRAND_COVER },
      });
      replaced++;
      console.log(`[toi-logo] ${b.slug} → ${NEWS_BRAND_COVER}`);
    } catch (err) {
      console.warn(`[toi-logo] fail ${b.slug}:`, err);
    }
  }

  console.log(JSON.stringify({ blogs: blogs.length, scanned, replaced }));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
