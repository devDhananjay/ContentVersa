/**
 * Null out Blog.coverImage values that point to missing /uploads/ files.
 *
 *   npx tsx scripts/clear-broken-covers.ts
 */
import { readdirSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

const prisma = new PrismaClient();

async function main() {
  const dir =
    process.env.UPLOAD_DIR?.trim() ||
    "/home/ec2-user/ContentVersa/data/uploads";
  const images = new Set(
    readdirSync(dir).filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f))
  );

  const blogs = await prisma.blog.findMany({
    where: { coverImage: { contains: "/uploads/" } },
    select: { id: true, coverImage: true },
  });

  const broken: string[] = [];
  for (const b of blogs) {
    const name = b.coverImage!.split("/").pop()!.split("?")[0];
    if (!images.has(name)) broken.push(b.id);
  }

  const res = broken.length
    ? await prisma.blog.updateMany({
        where: { id: { in: broken } },
        data: { coverImage: null },
      })
    : { count: 0 };

  console.log(
    JSON.stringify({
      clearedBrokenCovers: res.count,
      remainingDiskImages: images.size,
    })
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
