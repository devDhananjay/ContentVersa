import Link from "next/link";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobPilotHomeClient } from "@/components/jobpilot/home-client";

export const metadata = {
  title: "ContentVerse HirePilot",
  description: "Find jobs. Understand jobs. Apply smarter.",
};

export default function JobPilotHomePage() {
  return (
    <div className="container max-w-3xl py-10 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Target className="h-8 w-8 text-emerald-500" />
            ContentVerse HirePilot
          </h1>
          <p className="text-muted-foreground mt-1">
            Find jobs. Understand jobs. Apply smarter.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/jobpilot/tracker">Tracker</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/jobpilot/login?ext=1">Connect extension</Link>
          </Button>
        </div>
      </div>
      <JobPilotHomeClient />
    </div>
  );
}
