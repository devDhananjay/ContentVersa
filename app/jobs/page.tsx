import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { GovtJobCard } from "@/components/jobs/govt-job-card";
import { JobsHubCards } from "@/components/jobs/jobs-browse-shell";
import { JobsSectionHeader } from "@/components/jobs/jobs-section-header";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { PrivateJobCard } from "@/components/jobs/private-job-card";
import { Button } from "@/components/ui/button";
import { getGovtJobsCached } from "@/lib/jobs/data";
import { PRIVATE_JOBS } from "@/lib/jobs/private-jobs";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Jobs — Government & Private Careers India",
  description:
    "Latest sarkari jobs, results, admit cards and private-sector openings on ContentVerse India.",
  path: "/jobs",
  image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1600",
});

export default async function JobsHubPage() {
  const govtPreview = await getGovtJobsCached("jobs");
  const showWarning = !govtPreview.configured || Boolean(govtPreview.error);

  return (
    <div className="space-y-10">
      <HubEditorialIntro title="Careers on ContentVerse">
        <p>
          The Jobs Hub aggregates government (sarkari) notifications and curated private-sector
          openings for Indian readers. Listings link to official sources — ContentVerse does not
          charge applicants. Alongside listings, we publish career guides, exam prep tips, and
          workplace essays from writers in our Careers category.
        </p>
        <p>
          If you write about jobs, freelancing, or professional growth, publish on ContentVerse
          and apply for the Creator Program after two quality articles.
        </p>
      </HubEditorialIntro>

      {showWarning && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="text-muted-foreground">
            {govtPreview.error?.includes("not subscribed") ? (
              <>
                Subscribe to <strong className="text-foreground">Sarkari Result</strong> on RapidAPI
                with your <code className="rounded bg-muted px-1 text-xs">RAPIDAPI_KEY</code>.
              </>
            ) : govtPreview.error ? (
              govtPreview.error
            ) : (
              <>
                Add <code className="rounded bg-muted px-1 text-xs">RAPIDAPI_KEY</code> to enable
                live government listings.
              </>
            )}
          </p>
        </div>
      )}

      <JobsHubCards />

      <section>
        <div className="flex items-end justify-between gap-4 mb-5">
          <JobsSectionHeader
            eyebrow="Sarkari"
            title="Latest"
            highlight="Govt Jobs"
            description="Fresh notifications from Sarkari Result — tap any card for official details."
            className="mb-0"
          />
          <Button asChild variant="outline" size="sm" className="shrink-0 hidden sm:inline-flex gap-1.5">
            <Link href="/jobs/govt">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {govtPreview.listings.length > 0 ? (
          <div className="grid gap-3">
            {govtPreview.listings.slice(0, 6).map((item) => (
              <GovtJobCard key={item.link} item={item} showDate />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            No government listings available right now.
          </div>
        )}

        <Button asChild variant="outline" size="sm" className="mt-4 w-full sm:hidden gap-1.5">
          <Link href="/jobs/govt">
            View all govt jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 mb-5">
          <JobsSectionHeader
            eyebrow="Private sector"
            title="Featured"
            highlight="Openings"
            description="Curated roles from Indian startups and enterprises."
            className="mb-0"
          />
          <Button asChild variant="outline" size="sm" className="shrink-0 hidden sm:inline-flex gap-1.5">
            <Link href="/jobs/private">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {PRIVATE_JOBS.slice(0, 4).map((job) => (
            <PrivateJobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}
