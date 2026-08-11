/** Extract plain text from uploaded resume files (PDF / text / docx-ish). */

export async function extractResumeText(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): Promise<string> {
  const lower = (fileName || "").toLowerCase();
  const isPdf =
    mimeType.includes("pdf") || lower.endsWith(".pdf");
  const isText =
    mimeType.startsWith("text/") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md");

  if (isText) {
    return buffer.toString("utf8").trim();
  }

  if (isPdf) {
    try {
      // pdf-parse is CJS
      const pdfParse = (await import("pdf-parse")).default as (
        data: Buffer
      ) => Promise<{ text: string }>;
      const result = await pdfParse(buffer);
      return (result.text || "").replace(/\s+\n/g, "\n").trim();
    } catch (err) {
      console.error("[jobpilot] pdf parse failed", err);
      throw new Error("Could not read PDF. Try a text resume or another file.");
    }
  }

  // DOCX / others: best-effort UTF-8 strip of binary junk
  const asText = buffer.toString("utf8");
  const cleaned = asText
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (cleaned.length < 80) {
    throw new Error(
      "Unsupported resume format. Upload PDF or TXT (DOCX support is limited)."
    );
  }

  return cleaned.slice(0, 50000);
}
