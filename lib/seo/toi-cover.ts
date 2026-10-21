/**
 * Server-only: sanitize TOI covers.
 * - Full-frame red "TOI" logo placeholders → replace with ContentVerse brand cover
 * - Normal photos → strip overlay URL params + optional corner crop/badge on rehost
 *
 * URL cleaning (client-safe) lives in `toi-cover-url.ts`.
 */

import path from "node:path";
import { saveUploadedImage } from "@/lib/storage/save-upload";
import {
  cleanToiImageUrl,
  isToiCdnUrl,
} from "@/lib/seo/toi-cover-url";
export {
  cleanToiImageUrl,
  isToiCdnUrl,
  isContentVerseBrandCover,
  NEWS_BRAND_COVER,
} from "@/lib/seo/toi-cover-url";

import { NEWS_BRAND_COVER } from "@/lib/seo/toi-cover-url";

function logoPath(): string {
  return path.join(process.cwd(), "public", "logo-icon.png");
}

/**
 * Detect the full-frame red Times of India logo placeholder
 * (solid TOI-red field + white "TOI" letters — not a normal photo).
 */
export async function isToiBrandPlaceholder(
  imageBuf: Buffer
): Promise<boolean> {
  try {
    const sharp = (await import("sharp")).default;
    const { data, info } = await sharp(imageBuf)
      .resize(160, 90, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    let toiRed = 0;
    let white = 0;
    let edgeToi = 0;
    let edgeN = 0;
    let centerWhite = 0;
    let centerN = 0;
    const bins = new Set<string>();
    const total = info.width * info.height;

    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const i = (y * info.width + x) * 3;
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        bins.add(`${r >> 4},${g >> 4},${b >> 4}`);

        const isToiRed =
          r >= 190 && g <= 90 && b <= 90 && r - g >= 100 && r - b >= 100;
        const isWhite = r >= 200 && g >= 200 && b >= 200;
        if (isToiRed) toiRed++;
        if (isWhite) white++;

        const edge =
          x < 16 || x >= info.width - 16 || y < 10 || y >= info.height - 10;
        const center = x > 40 && x < 120 && y > 25 && y < 65;
        if (edge) {
          edgeN++;
          if (isToiRed) edgeToi++;
        }
        if (center) {
          centerN++;
          if (isWhite) centerWhite++;
        }
      }
    }

    const toiRedPct = toiRed / total;
    const whitePct = white / total;
    const edgeToiPct = edgeN ? edgeToi / edgeN : 0;
    const centerWhitePct = centerN ? centerWhite / centerN : 0;

    return (
      toiRedPct >= 0.5 &&
      whitePct >= 0.04 &&
      whitePct <= 0.35 &&
      edgeToiPct >= 0.55 &&
      centerWhitePct >= 0.08 &&
      bins.size <= 80
    );
  } catch {
    return false;
  }
}

/** 16:9 JPEG with ContentVerse logo centered on dark brand background. */
export async function renderContentVerseCoverJpeg(): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const w = 1280;
  const h = 720;
  const logoW = Math.round(w * 0.42);

  const logoBuf = await sharp(logoPath())
    .resize(logoW, Math.round(logoW * 0.55), {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: w,
      height: h,
      channels: 3,
      background: { r: 10, g: 10, b: 15 },
    },
  })
    .composite([{ input: logoBuf, gravity: "centre" }])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
}

/** Prefer static public asset (no disk write). Fallback: upload generated JPEG. */
export async function saveContentVerseBrandCover(): Promise<string> {
  return NEWS_BRAND_COVER;
}

/**
 * Download a (cleaned) TOI image.
 * Full TOI-logo placeholders → ContentVerse brand cover.
 * Else stamp a small ContentVerse badge top-right and rehost.
 */
export async function rehostToiCoverWithBrand(
  sourceUrl: string
): Promise<string | null> {
  const cleaned = cleanToiImageUrl(sourceUrl);
  if (!cleaned.startsWith("http")) return null;

  try {
    const sharp = (await import("sharp")).default;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 18_000);
    let res: Response;
    try {
      res = await fetch(cleaned, {
        signal: ctrl.signal,
        headers: {
          "User-Agent":
            "ContentVerseIndiaBot/1.0 (+https://contentverse.co.in; cover sanitize)",
          Accept: "image/*,*/*",
        },
        cache: "no-store",
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1_024 || buf.length > 8 * 1024 * 1024) return null;

    if (await isToiBrandPlaceholder(buf)) {
      return saveContentVerseBrandCover();
    }

    const rotated = sharp(buf).rotate();
    const meta = await rotated.metadata();
    const srcW = meta.width || 1280;
    const srcH = meta.height || 720;

    // Crop out small TOI badge zone (top-right), then scale back.
    const cropR = Math.max(24, Math.round(srcW * 0.1));
    const cropT = Math.max(16, Math.round(srcH * 0.08));
    const cropped = await rotated
      .extract({
        left: 0,
        top: cropT,
        width: Math.max(64, srcW - cropR),
        height: Math.max(64, srcH - cropT),
      })
      .resize(srcW, srcH, { fit: "fill" })
      .toBuffer();

    const base = sharp(cropped);
    const w = srcW;

    const badgeW = Math.max(110, Math.min(260, Math.round(w * 0.16)));
    const badgeH = Math.round(badgeW * 0.55);
    const margin = Math.max(10, Math.round(w * 0.012));

    const plate = await sharp({
      create: {
        width: badgeW,
        height: badgeH,
        channels: 4,
        background: { r: 10, g: 10, b: 15, alpha: 0.9 },
      },
    })
      .png()
      .toBuffer();

    const logoBuf = await sharp(logoPath())
      .resize(badgeW - 16, badgeH - 12, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    const badge = await sharp(plate)
      .composite([{ input: logoBuf, gravity: "centre" }])
      .png()
      .toBuffer();

    const out = await base
      .composite([
        {
          input: badge,
          left: Math.max(0, w - badgeW - margin),
          top: margin,
        },
      ])
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();

    const filename = `news-cover-${Date.now().toString(36)}.jpg`;
    const { url } = await saveUploadedImage(out, filename, "image/jpeg");
    return url;
  } catch (err) {
    console.warn("[toi-cover] rehost failed:", err);
    return null;
  }
}

/**
 * Prefer rehosted branded cover; fall back to cleaned remote URL.
 * Full TOI-logo placeholders become ContentVerse brand covers.
 */
export async function resolveToiCoverForIngest(
  sourceUrl: string | null | undefined
): Promise<string | null> {
  const raw = sourceUrl?.trim();
  if (!raw) return null;
  if (!isToiCdnUrl(raw) && !raw.includes("overlay-toi")) {
    return raw;
  }
  const cleaned = cleanToiImageUrl(raw);
  const hosted = await rehostToiCoverWithBrand(cleaned);
  return hosted || cleaned || null;
}
