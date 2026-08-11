import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireJobPilotUser } from "@/lib/jobpilot/auth-token";
import { getUsageSnapshot } from "@/lib/jobpilot/quotas";
import { jobPilotErrorResponse } from "@/lib/jobpilot/http";
import type { JobPilotMeResponse } from "@/lib/jobpilot/types";

export async function GET() {
  try {
    const user = await requireJobPilotUser();
    let hasResume = false;
    if (isDatabaseConfigured()) {
      const resume = await prisma.jobPilotResume.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });
      hasResume = Boolean(resume);
    }
    const usage = await getUsageSnapshot(user.userId);
    const body: JobPilotMeResponse = {
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        username: user.username,
      },
      hasResume,
      usage,
    };
    return NextResponse.json(body);
  } catch (err) {
    return jobPilotErrorResponse(err);
  }
}
