import { Suspense } from "react";
import { JobPilotLoginClient } from "@/components/jobpilot/login-client";

export const metadata = {
  title: "JobPilot AI — Sign in",
  description: "Connect JobPilot AI Chrome extension to your ContentVerse account.",
};

export default function JobPilotLoginPage() {
  return (
    <div className="container max-w-lg py-16">
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <JobPilotLoginClient />
      </Suspense>
    </div>
  );
}
