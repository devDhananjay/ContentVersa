/** Canvas helpers for client-side image cropping (react-easy-crop). */

export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
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
 */
export async function getCroppedImageBlob(
  imageSrc: string,
  crop: PixelCrop,
  opts?: { mimeType?: string; quality?: number; maxWidth?: number }
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
