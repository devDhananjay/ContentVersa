/** Canvas helpers for client-side image cropping (react-easy-crop). */

export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Logo placed on the cropped image. x/y/width are fractions of the crop (0–1). */
export type LogoOverlay = {
  src: string;
  /** Top-left X as fraction of cropped width (0–1). */
  xPct: number;
  /** Top-left Y as fraction of cropped height (0–1). */
  yPct: number;
  /** Logo width as fraction of cropped width (0–1). */
  widthPct: number;
  opacity?: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Failed to load image")));
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

/**
 * Draw the cropped region to a canvas and return a JPEG/WebP/PNG Blob.
 * Optionally composites a logo overlay on top of the crop.
 */
export async function getCroppedImageBlob(
  imageSrc: string,
  crop: PixelCrop,
  opts?: {
    mimeType?: string;
    quality?: number;
    maxWidth?: number;
    logo?: LogoOverlay | null;
  }
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const mimeType = opts?.mimeType || "image/jpeg";
  const quality = opts?.quality ?? 0.92;
  const maxWidth = opts?.maxWidth ?? 2400;

  const scale = Math.min(1, maxWidth / Math.max(crop.width, 1));
  const outW = Math.max(1, Math.round(crop.width * scale));
  const outH = Math.max(1, Math.round(crop.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outW,
    outH
  );

  if (opts?.logo?.src) {
    const logo = await loadImage(opts.logo.src);
    const widthPct = Math.min(0.6, Math.max(0.05, opts.logo.widthPct));
    const logoW = Math.max(8, Math.round(outW * widthPct));
    const aspect = logo.naturalHeight / Math.max(1, logo.naturalWidth);
    const logoH = Math.max(8, Math.round(logoW * aspect));
    const maxX = Math.max(0, outW - logoW);
    const maxY = Math.max(0, outH - logoH);
    const logoX = Math.min(maxX, Math.max(0, Math.round(opts.logo.xPct * outW)));
    const logoY = Math.min(maxY, Math.max(0, Math.round(opts.logo.yPct * outH)));
    const opacity = Math.min(1, Math.max(0.15, opts.logo.opacity ?? 1));
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.drawImage(logo, logoX, logoY, logoW, logoH);
    ctx.restore();
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not create cropped image"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export function blobToFile(blob: Blob, originalName: string): File {
  const base = originalName.replace(/\.[^.]+$/, "") || "image";
  const ext =
    blob.type === "image/png"
      ? "png"
      : blob.type === "image/webp"
        ? "webp"
        : "jpg";
  return new File([blob], `${base}-cropped.${ext}`, {
    type: blob.type || "image/jpeg",
    lastModified: Date.now(),
  });
}
