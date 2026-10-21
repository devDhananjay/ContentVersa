/**
 * Delete upload files on disk that are not referenced by Blog or Profile coverImage.
 *
 *   npm run db:purge-orphan-uploads
 *   npm run db:purge-orphan-uploads -- --dry-run
 */
import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

function filenameFromCover(url: string | null | undefined): string | null {
  if (!url?.includes("/uploads/")) return null;
  const name = url.split("/").pop()?.split("?")[0];
  return name || null;
}

function getUploadsDir() {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) return configured;
  return join(process.cwd(), "public", "uploads");
}

async function main() {
  const dir = getUploadsDir();
  const files = await readdir(dir);
  const images = files.filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f));

  const [blogs, profiles] = await Promise.all([
    prisma.blog.findMany({ select: { coverImage: true } }),
    prisma.profile.findMany({ select: { coverImage: true } }),
  ]);

  const used = new Set<string>();
  for (const row of [...blogs, ...profiles]) {
    const name = filenameFromCover(row.coverImage);
    if (name) used.add(name);
  }

  const orphans = images.filter((f) => !used.has(f));
  console.log(
    JSON.stringify(
      {
        uploadDir: dir,
        diskImages: images.length,
        linked: used.size,
        orphans: orphans.length,
        dryRun,
      },
      null,
      2
    )
  );

  let deleted = 0;
  for (const file of orphans) {
    const path = join(dir, file);
    if (dryRun) {
      console.log(`[dry-run] would delete ${file}`);
      continue;
    }
    await unlink(path);
    deleted += 1;
  }

  console.log(JSON.stringify({ deleted, remainingOrphans: dryRun ? orphans.length : 0 }));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
