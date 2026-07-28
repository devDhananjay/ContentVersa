import { PDFDocument } from "pdf-lib";

export const PDF_MAX_BYTES = 25 * 1024 * 1024; // 25 MB per file
export const PDF_MAX_FILES = 20;

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function assertPdfFile(file: File) {
  const okType =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");
  if (!okType) throw new Error(`“${file.name}” is not a PDF.`);
  if (file.size > PDF_MAX_BYTES) {
    throw new Error(
      `“${file.name}” is too large (${formatBytes(file.size)}). Max ${formatBytes(PDF_MAX_BYTES)}.`
    );
  }
}

export function assertImageFile(file: File) {
  const name = file.name.toLowerCase();
  const ok =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png");
  if (!ok) throw new Error(`“${file.name}” must be JPG or PNG.`);
  if (file.size > PDF_MAX_BYTES) {
    throw new Error(
      `“${file.name}” is too large. Max ${formatBytes(PDF_MAX_BYTES)}.`
    );
  }
}

async function fileToBytes(file: File): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  return new Uint8Array(buf);
}

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  if (files.length < 2) throw new Error("Add at least 2 PDF files to merge.");
  if (files.length > PDF_MAX_FILES) {
    throw new Error(`Max ${PDF_MAX_FILES} files at once.`);
  }
  const out = await PDFDocument.create();
  for (const file of files) {
    assertPdfFile(file);
    const src = await PDFDocument.load(await fileToBytes(file), {
      ignoreEncryption: false,
    });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  return out.save({ useObjectStreams: true });
}

/** Extract inclusive 1-based page range into a new PDF. */
export async function splitPdf(
  file: File,
  fromPage: number,
  toPage: number
): Promise<Uint8Array> {
  assertPdfFile(file);
  const src = await PDFDocument.load(await fileToBytes(file), {
    ignoreEncryption: false,
  });
  const total = src.getPageCount();
  if (total < 1) throw new Error("This PDF has no pages.");
  const from = Math.max(1, Math.floor(fromPage));
  const to = Math.min(total, Math.floor(toPage));
  if (from > to) throw new Error("Start page must be ≤ end page.");
  const out = await PDFDocument.create();
  const indices = Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i);
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  return out.save({ useObjectStreams: true });
}

export async function getPdfPageCount(file: File): Promise<number> {
  assertPdfFile(file);
  const src = await PDFDocument.load(await fileToBytes(file), {
    ignoreEncryption: false,
  });
  return src.getPageCount();
}

/**
 * Basic size reduction: rewrite PDF with object streams.
 * Does not guarantee large savings on already-optimized scans.
 */
export async function compressPdf(file: File): Promise<{
  bytes: Uint8Array;
  before: number;
  after: number;
}> {
  assertPdfFile(file);
  const before = file.size;
  const src = await PDFDocument.load(await fileToBytes(file), {
    ignoreEncryption: false,
  });
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, src.getPageIndices());
  pages.forEach((p) => out.addPage(p));
  const bytes = await out.save({ useObjectStreams: true });
  return { bytes, before, after: bytes.byteLength };
}

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  if (!files.length) throw new Error("Add at least one JPG or PNG image.");
  if (files.length > PDF_MAX_FILES) {
    throw new Error(`Max ${PDF_MAX_FILES} images at once.`);
  }
  const out = await PDFDocument.create();
  for (const file of files) {
    assertImageFile(file);
    const bytes = await fileToBytes(file);
    const name = file.name.toLowerCase();
    const isPng =
      file.type === "image/png" || name.endsWith(".png");
    const image = isPng
      ? await out.embedPng(bytes)
      : await out.embedJpg(bytes);
    const page = out.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  return out.save({ useObjectStreams: true });
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
