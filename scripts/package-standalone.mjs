/**
 * Packages Next.js standalone output into ./build for server deployment.
 * Run: npm run build:server
 */
import { cpSync, rmSync, existsSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";
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

  // `next dev --turbopack` can pollute .next while a prod build runs — refuse
  // packaging if any nested HMR / next-devtools assets are present.
  const bad = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, name.name);
      if (name.isDirectory()) walk(p);
      else if (/hmr-client|next-devtools|browser_dev_hmr/i.test(name.name)) {
        bad.push(p);
      }
    }
  };
  walk(staticDest);
  if (bad.length > 0) {
    console.error(
      "Refusing to package a polluted build — found HMR/devtools assets:\n  " +
        bad.slice(0, 8).join("\n  ") +
        "\nStop `next dev`, run `rm -rf .next build`, then `NODE_ENV=production npm run build:server`."
    );
    process.exit(1);
  }
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
