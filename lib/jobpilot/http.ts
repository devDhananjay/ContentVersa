import { NextResponse } from "next/server";

export function jobPilotErrorResponse(err: unknown) {
  if (err instanceof Error) {
    if (err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    if (err.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (err.message === "ANALYSIS_LIMIT") {
      return NextResponse.json(
        {
          error: "Free plan limit reached (5 job analyses / month). Upgrade to PRO.",
          code: "ANALYSIS_LIMIT",
          upgrade: true,
        },
        { status: 402 }
      );
    }
    if (err.message === "COVER_LETTER_LIMIT") {
      return NextResponse.json(
        {
          error: "Free plan limit reached (3 cover letters / month). Upgrade to PRO.",
          code: "COVER_LETTER_LIMIT",
          upgrade: true,
        },
        { status: 402 }
      );
    }
    if (err.message === "NO_RESUME") {
      return NextResponse.json(
        { error: "Upload a resume first", code: "NO_RESUME" },
        { status: 400 }
      );
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  console.error("[jobpilot]", err);
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Request failed" },
    { status: 500 }
  );
}
