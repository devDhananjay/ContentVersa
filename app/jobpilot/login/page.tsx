import { Suspense } from "react";
import { JobPilotLoginClient } from "@/components/jobpilot/login-client";

export const metadata = {
  title: "ContentVerse HirePilot — Sign in",
  description: "Connect ContentVerse HirePilot Chrome extension to your account.",
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
