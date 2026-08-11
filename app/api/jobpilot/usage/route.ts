import { NextResponse } from "next/server";
import { getUsageSnapshot } from "@/lib/jobpilot/quotas";
import { requireJobPilotUser } from "@/lib/jobpilot/auth-token";
import { jobPilotErrorResponse } from "@/lib/jobpilot/http";

export async function GET() {
  try {
    const user = await requireJobPilotUser();
    const usage = await getUsageSnapshot(user.userId);
    return NextResponse.json({ usage });
  } catch (err) {
    return jobPilotErrorResponse(err);
  }
}
