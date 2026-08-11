import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { exchangeSessionForJobPilotToken } from "@/lib/jobpilot/auth-token";
import { jobPilotErrorResponse } from "@/lib/jobpilot/http";

/** POST — exchange ContentVerse session cookie for JobPilot Bearer token. */
export async function POST() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    const token = await exchangeSessionForJobPilotToken(session);
    return NextResponse.json({
      token,
      user: {
        id: session.sub,
        email: session.email,
        username: session.username,
        name: session.name ?? null,
      },
    });
  } catch (err) {
    return jobPilotErrorResponse(err);
  }
}
