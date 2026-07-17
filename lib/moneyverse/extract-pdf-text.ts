/**
 * Extract plain text from a bank-statement PDF in memory.
 * Used so multi-page statements can be analyzed without sending the
 * entire PDF binary through Gemini vision (which often fails for long files).
 */
export async function extractPdfText(
  buffer: Buffer
): Promise<{ text: string; pages: number } | null> {
  try {
    // Import the implementation file directly — the package root has a
    // debug branch that can try to open a missing test PDF when bundled.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
      data: Buffer
    ) => Promise<{ text?: string; numpages?: number }>;
    const parsed = await pdfParse(buffer);
    const text = String(parsed.text || "")
      .replace(/\u0000/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (text.length < 80) return null;
    return { text, pages: Number(parsed.numpages) || 0 };
  } catch (err) {
    console.error(
      "[extract-pdf-text]",
      err instanceof Error ? err.message : "parse failed"
    );
    return null;
  }
}
