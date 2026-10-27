import type { Metadata } from "next";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { PrivateJobsBoard } from "@/components/jobs/private-jobs-board";
import { JobsSectionHeader } from "@/components/jobs/jobs-section-header";
import { PRIVATE_JOBS } from "@/lib/jobs/private-jobs";
import { buildLocaleHubMetadata } from "@/lib/i18n/locale-metadata";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocaleHubMetadata({
    path: "/jobs/private",
    titleEn: "Private Jobs India — Tech, Corporate & Fresher Openings",
    titleHi: "Private Jobs India — Tech, Corporate & Fresher Openings",
    descriptionEn:
      "Browse private-sector jobs across India — full-time, remote, internships, IT and corporate roles on ContentVerse India.",
    descriptionHi:
      "Browse private-sector jobs across India — full-time, remote, internships, IT and corporate roles on ContentVerse India.",
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
}

export default async function PrivateJobsPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <JobsSectionHeader
        eyebrow={t(dict, "hubs.jobsSectionPrivate")}
        title="Corporate"
        highlight="Openings"
        description="Search and filter curated roles from Indian companies. External apply links open company career pages."
      />

      <PrivateJobsBoard jobs={PRIVATE_JOBS} />
      <HubAdSense />
    </div>
  );
}
