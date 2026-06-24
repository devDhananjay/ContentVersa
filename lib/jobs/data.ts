import { cache } from "react";
import { GOVT_CATEGORIES } from "@/lib/jobs/constants";
import { fetchSarkariListings, isSarkariApiConfigured } from "@/lib/jobs/sarkari-client";
import type { SarkariCategory, SarkariListing } from "@/lib/jobs/types";

export type GovtJobsData = {
  configured: boolean;
  category: SarkariCategory;
  listings: SarkariListing[];
  count: number;
  error?: string;
};

export const getGovtJobsCached = cache(async (category: SarkariCategory): Promise<GovtJobsData> => {
  const configured = isSarkariApiConfigured();

  if (!configured) {
    return { configured: false, category, listings: [], count: 0 };
  }

  try {
    const response = await fetchSarkariListings(category);
    return {
      configured: true,
      category,
      listings: response.data,
      count: response.count,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load government updates";
    return {
      configured: true,
      category,
      listings: [],
      count: 0,
      error: message,
    };
  }
});

export function parseGovtCategory(value: string | undefined): SarkariCategory {
  const found = GOVT_CATEGORIES.find((item) => item.id === value);
  return found?.id ?? "jobs";
}
