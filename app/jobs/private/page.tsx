import type { Metadata } from "next";
import { PrivateJobsBoard } from "@/components/jobs/private-jobs-board";
import { JobsSectionHeader } from "@/components/jobs/jobs-section-header";
import { PRIVATE_JOBS } from "@/lib/jobs/private-jobs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Private Jobs India — Tech, Corporate & Fresher Openings",
  description:
    "Browse private-sector jobs across India — full-time, remote, internships, IT and corporate roles on ContentVerse India.",
  path: "/jobs/private",
  keywords: [
    "private jobs India",
    "IT jobs India",
    "remote jobs India",
    "fresher jobs India",
    "internship India",
    "corporate jobs India",
    "work from home jobs India",
    "ContentVerse India jobs",
  ],
  image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600",
});

export default function PrivateJobsPage() {
  return (
    <div className="space-y-6">
      <JobsSectionHeader
        eyebrow="Private sector"
        title="Corporate"
        highlight="Openings"
        description="Search and filter curated roles from Indian companies. External apply links open company career pages."
      />

      <PrivateJobsBoard jobs={PRIVATE_JOBS} />
    </div>
  );
}
