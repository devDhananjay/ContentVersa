import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { refreshSessionIfStale } from "@/lib/auth/refresh-session";
import {
  analyzeBankStatement,
  isBankStatementAnalyzerConfigured,
} from "@/lib/moneyverse/bank-statement-analyzer";
import {
  BankStatementQuotaExceededError,
  reserveBankStatementAnalysis,
} from "@/lib/moneyverse/bank-statement-quota";
import { isDatabaseConfigured } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
]);

export async function POST(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }
  if (!isBankStatementAnalyzerConfigured()) {
    return NextResponse.json(
      { error: "Bank statement analyzer needs GEMINI_API_KEY on the server" },
      { status: 503 }
    );
  }

  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "Sign in to analyze a bank statement" }, { status: 401 });
  }

  const session = await refreshSessionIfStale(current);

  try {
    const form = await req.formData();
    const file = form.get("statement");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload a bank statement file" }, { status: 400 });
    }

    const mimeType = (file.type || "").toLowerCase();
    if (!ALLOWED_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: "Use a PDF, JPG, PNG, or WebP bank statement" },
        { status: 400 }
      );
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Bank statement must be between 1 byte and 10 MB" },
        { status: 400 }
      );
    }

    // Reserve after validating the upload but before the paid AI call.
    const quota = await reserveBankStatementAnalysis(session);
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const result = await analyzeBankStatement(mimeType, base64);

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Could not read transactions from this statement. For long multi-page PDFs, use an unlocked statement PDF (not a scanned photo of every page).",
          quota,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      ok: true,
      analysis: result,
      quota,
      privacy: "Uploaded file and analysis are not stored by ContentVerse.",
    });
  } catch (err) {
    if (err instanceof BankStatementQuotaExceededError) {
      return NextResponse.json(
        { error: "Free limit reached. Each user can analyze 5 bank statements." },
        { status: 429 }
      );
    }
    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "User account not found" }, { status: 401 });
    }
    console.error(
      "[api/moneyverse/bank-statement/analyze]",
      err instanceof Error ? err.message : "Unknown error"
    );
    return NextResponse.json({ error: "Statement analysis failed — try again" }, { status: 500 });
  }
}
