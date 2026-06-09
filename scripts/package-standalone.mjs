/**
 * Packages Next.js standalone output into ./build for server deployment.
 * Run: npm run build:server
 */
import { cpSync, rmSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
const buildDir = join(root, "build");

if (!existsSync(standalone)) {
  console.error("Missing .next/standalone — run `npm run build` first.");
  process.exit(1);
}

if (existsSync(buildDir)) {
  rmSync(buildDir, { recursive: true, force: true });
}

mkdirSync(buildDir, { recursive: true });

cpSync(standalone, buildDir, { recursive: true });

const staticSrc = join(root, ".next", "static");
const staticDest = join(buildDir, ".next", "static");
if (existsSync(staticSrc)) {
  mkdirSync(join(buildDir, ".next"), { recursive: true });
  cpSync(staticSrc, staticDest, { recursive: true });
}

const publicSrc = join(root, "public");
const publicDest = join(buildDir, "public");
if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true });
}

writeFileSync(
  join(buildDir, "README-SERVER.txt"),
  `ContentVerse — standalone server bundle

1. Upload this entire "build" folder to your server.
2. Set environment variables (DATABASE_URL, JWT_SECRET, GOOGLE_*, NEXT_PUBLIC_APP_URL=https://contentverse.co.in, AWS_S3_* or UPLOAD_DIR, etc.)
3. From inside this folder run:
   NODE_ENV=production node server.js
   (default port 3000 — set PORT=8080 if needed)

Requires Node.js 20+ on the server.
`
);

console.log("Packaged standalone app → build/");
console.log("Start on server: cd build && NODE_ENV=production node server.js");
