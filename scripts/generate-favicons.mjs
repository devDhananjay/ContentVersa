/**
 * Brain logo → circular favicons with gradient border (ContentVerse brand).
 * Run: node scripts/generate-favicons.mjs
 */
import sharp from "sharp";
import { spawnSync } from "node:child_process";
import { copyFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "public/logo-icon.png");

/** Crop brain + rings only (exclude CONTENTVERSE text at bottom). */
const ICON_CROP = { left: 48, top: 28, width: 416, height: 400 };

const OUTPUTS = [
  { size: 16, path: "public/favicon-16x16.png" },
  { size: 32, path: "public/favicon-32x32.png" },
  { size: 48, path: "public/favicon-48x48.png" },
  { size: 180, path: "public/apple-touch-icon.png" },
  { size: 192, path: "public/icon-192.png" },
  { size: 512, path: "public/icon-512.png" },
];

async function renderFavicon(size) {
  const border = Math.max(2, Math.round(size * 0.07));
  const pad = Math.max(1, Math.round(size * 0.06));
  const inner = size - border * 2;
  const logoBox = inner - pad * 2;

  const cropped = await sharp(SRC)
    .extract(ICON_CROP)
    .resize(logoBox, logoBox, {
      fit: "contain",
      background: { r: 10, g: 10, b: 15, alpha: 0 },
    })
    .png()
    .toBuffer();

  const circleClip = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${logoBox}" height="${logoBox}">
      <circle cx="${logoBox / 2}" cy="${logoBox / 2}" r="${logoBox / 2}" fill="white"/>
    </svg>`
  );

  const clippedLogo = await sharp(cropped)
    .composite([{ input: circleClip, blend: "dest-in" }])
    .png()
    .toBuffer();

  const frame = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <defs>
        <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c084fc"/>
          <stop offset="45%" stop-color="#a855f7"/>
          <stop offset="100%" stop-color="#22d3ee"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size / 2}" ry="${size / 2}" fill="#0a0a0f"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - border / 2}" fill="none"
        stroke="url(#ring)" stroke-width="${border}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - border - 1}" fill="#0a0a0f"/>
    </svg>`
  );

  const offset = border + pad;
  return sharp(frame)
    .composite([{ input: clippedLogo, left: offset, top: offset }])
    .png()
    .toBuffer();
}

async function main() {
  for (const { size, path } of OUTPUTS) {
    const buf = await renderFavicon(size);
    writeFileSync(join(ROOT, path), buf);
  }

  copyFileSync(join(ROOT, "public/apple-touch-icon.png"), join(ROOT, "app/apple-icon.png"));

  const icoPath = join(ROOT, "public/favicon.ico");
  const icoResult = spawnSync(
    "npx",
    [
      "--yes",
      "png-to-ico",
      join(ROOT, "public/favicon-16x16.png"),
      join(ROOT, "public/favicon-32x32.png"),
      join(ROOT, "public/favicon-48x48.png"),
    ],
    { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] }
  );
  if (icoResult.status !== 0) {
    throw new Error(icoResult.stderr?.toString() || "png-to-ico failed");
  }
  writeFileSync(icoPath, icoResult.stdout);
  copyFileSync(icoPath, join(ROOT, "app/favicon.ico"));

  console.log("Circular favicons with gradient border → public/ & app/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
