import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import { GovtCategoryTabs } from "@/components/jobs/govt-category-tabs";
import { GovtJobCard } from "@/components/jobs/govt-job-card";
import { JobsSectionHeader } from "@/components/jobs/jobs-section-header";
import { GOVT_CATEGORIES } from "@/lib/jobs/constants";
import { getGovtJobsCached, parseGovtCategory } from "@/lib/jobs/data";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ cat?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { cat } = await searchParams;
  const category = parseGovtCategory(cat);
  const meta = GOVT_CATEGORIES.find((item) => item.id === category);

  return buildMetadata({
    title: `Government ${meta?.label ?? "Jobs"} — Sarkari Updates`,
    description:
      meta?.description ??
      "Latest government job notifications, results and exam updates from Sarkari Result.",
    path: `/jobs/govt${cat ? `?cat=${cat}` : ""}`,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600",
  });
}

export default async function GovtJobsPage({ searchParams }: PageProps) {
  const { cat } = await searchParams;
  const category = parseGovtCategory(cat);
  const data = await getGovtJobsCached(category);
  const meta = GOVT_CATEGORIES.find((item) => item.id === category)!;
  const showDate = category === "jobs";

  return (
    <div className="space-y-6">
      {( !data.configured || data.error) && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="text-muted-foreground">
            {data.error?.includes("not subscribed") ? (
              <>
                Your RapidAPI key needs an active <strong className="text-foreground">Sarkari Result</strong>{" "}
                subscription to load live data.
              </>
            ) : data.error ? (
              data.error
            ) : (
              <>Set <code className="rounded bg-muted px-1 text-xs">RAPIDAPI_KEY</code> on the server.</>
            )}
          </p>
        </div>
      )}

      <JobsSectionHeader
        eyebrow="Sarkari Result"
        title={meta.label}
        highlight="Updates"
        description={meta.description}
      />

      <GovtCategoryTabs active={category} />

      <p className="text-sm text-muted-foreground">
        {data.count > 0 ? (
          <>
            <span className="font-medium text-foreground">{data.count}</span> listings · Opens official
            Sarkari Result pages in a new tab
          </>
        ) : (
          "Listings refresh every 30 minutes"
        )}
      </p>

      {data.listings.length > 0 ? (
        <div className="grid gap-3">
          {data.listings.map((item) => (
            <GovtJobCard key={item.link} item={item} showDate={showDate} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No {meta.label.toLowerCase()} available at the moment. Check back soon or try another
            category above.
          </p>
        </div>
      )}
    </div>
  );
}
