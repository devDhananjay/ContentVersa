import { JobPilotTrackerClient } from "@/components/jobpilot/tracker-client";

export const metadata = {
  title: "Job Tracker — JobPilot AI",
};

export default function JobPilotTrackerPage() {
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Job Tracker
      </h1>
      <p className="text-muted-foreground mt-1 mb-8">
        Track applications from Saved → Offer.
      </p>
      <JobPilotTrackerClient />
    </div>
  );
}
