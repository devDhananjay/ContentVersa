/**
 * Strip TOI watermark overlay params from Live News cover URLs,
 * replace full-frame TOI logo placeholders with ContentVerse brand covers,
 * optionally rehost normal photos with a corner badge.
 *
 *   npx tsx scripts/sanitize-toi-covers.ts
 *   npx tsx scripts/sanitize-toi-covers.ts --rehost
 *   npx tsx scripts/sanitize-toi-covers.ts --replace-toi-logo
 *   npx tsx scripts/sanitize-toi-covers.ts --limit=50
 */
import { PrismaClient } from "@prisma/client";
import { loadScriptEnv } from "./load-script-env";
import { cleanToiImageUrl, isToiCdnUrl } from "../lib/seo/toi-cover-url";

loadScriptEnv();

const prisma = new PrismaClient();

async function main() {
  const rehost = process.argv.includes("--rehost");
  const replaceToiLogo = process.argv.includes("--replace-toi-logo");
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) || 200 : 500;

  const blogs = await prisma.blog.findMany({
    where: {
      metaKeywords: { contains: "toi-rewrite" },
      coverImage: { not: null },
    },
    select: { id: true, slug: true, coverImage: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  let updated = 0;
  let rehosted = 0;
  let replacedLogo = 0;
  let skipped = 0;

  const coverMod = await import("../lib/seo/toi-cover");

  for (const b of blogs) {
    const raw = b.coverImage?.trim();
    if (!raw) {
      skipped++;
      continue;
    }
    if (coverMod.isContentVerseBrandCover(raw)) {
      skipped++;
      continue;
    }

    let next = raw;
    let didReplace = false;

    if (replaceToiLogo || rehost) {
      if (isToiCdnUrl(raw) || raw.includes("overlay-toi")) {
        const cleaned = cleanToiImageUrl(raw);
        try {
          const res = await fetch(cleaned, {
            headers: {
              "User-Agent":
                "ContentVerseIndiaBot/1.0 (+https://contentverse.co.in; cover sanitize)",
              Accept: "image/*,*/*",
            },
            cache: "no-store",
            signal: AbortSignal.timeout(18_000),
          });
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            if (await coverMod.isToiBrandPlaceholder(buf)) {
              next = await coverMod.saveContentVerseBrandCover();
              replacedLogo++;
              didReplace = true;
            } else if (rehost) {
              const hosted = await coverMod.rehostToiCoverWithBrand(cleaned);
              if (hosted) {
                next = hosted;
                rehosted++;
                didReplace = true;
              }
            }
          }
        } catch (err) {
          console.warn(`[toi-cover] fetch fail ${b.slug}:`, err);
        }
      }
    }

    if (!didReplace && (isToiCdnUrl(raw) || raw.includes("overlay-toi"))) {
      const cleaned = cleanToiImageUrl(raw);
      if (cleaned !== raw) next = cleaned;
    }

    if (next === raw) {
      skipped++;
      continue;
    }

    await prisma.blog.update({
      where: { id: b.id },
      data: { coverImage: next },
    });
    updated++;
    console.log(
      `[toi-cover] ${b.slug}: ${raw.slice(0, 55)}… → ${next.slice(0, 70)}`
    );
  }

  console.log(
    JSON.stringify(
      {
        scanned: blogs.length,
        updated,
        rehosted,
        replacedLogo,
        skipped,
        rehost,
        replaceToiLogo,
      },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
