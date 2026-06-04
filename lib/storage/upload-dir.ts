import path from "node:path";

/** Directory for user-uploaded images (outside standalone `build/` on production). */
export function getUploadsDirectory() {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "public", "uploads");
}
