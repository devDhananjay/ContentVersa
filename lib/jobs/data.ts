import { cache } from "react";
import { GOVT_CATEGORIES } from "@/lib/jobs/constants";
import {
  isQuotaOrRateLimitError,
  officialPortalsForCategory,
} from "@/lib/jobs/official-portals";
import { readSarkariCache, saveSarkariCache } from "@/lib/jobs/sarkari-disk-cache";
import { fetchSarkariListings, isSarkariApiConfigured } from "@/lib/jobs/sarkari-client";
import type { SarkariCategory, SarkariListing } from "@/lib/jobs/types";

export type GovtJobsData = {
  configured: boolean;
  category: SarkariCategory;
  listings: SarkariListing[];
  count: number;
  error?: string;
  /** live | cache | portals */
  source: "live" | "cache" | "portals" | "empty";
};

function sanitizePublicError(message: string): string {
  if (/rapidapi|sarkari-result|quota|BASIC/i.test(message)) {
    return "Live government listings are refreshing. Official portals are listed below.";
  }
  return message;
}

export const getGovtJobsCached = cache(
  async (category: SarkariCategory): Promise<GovtJobsData> => {
    const configured = isSarkariApiConfigured();

    if (!configured) {
      const portals = officialPortalsForCategory(category);
      return {
        configured: false,
        category,
        listings: portals,
        count: portals.length,
        source: "portals",
        error:
          "Live government feed is not configured — showing official portals.",
      };
    }

    try {
      const response = await fetchSarkariListings(category);
      if (response.data.length > 0) {
        saveSarkariCache(category, response);
      }
      return {
        configured: true,
        category,
        listings: response.data,
        count: response.count,
        source: "live",
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load government updates";

      const cached = readSarkariCache(category);
      if (cached?.data?.length) {
        return {
          configured: true,
          category,
          listings: cached.data,
          count: cached.count || cached.data.length,
          source: "cache",
          error: isQuotaOrRateLimitError(message)
            ? "Live feed is temporarily limited — showing the last saved listings."
            : `Live feed unavailable — showing last saved listings.`,
        };
      }

      const portals = officialPortalsForCategory(category);
      return {
        configured: true,
        category,
        listings: portals,
        count: portals.length,
        source: "portals",
        error: isQuotaOrRateLimitError(message)
          ? "Live listing feed hit its monthly limit — use official commission portals below until the feed renews."
          : sanitizePublicError(message),
      };
    }
  }
);

export function parseGovtCategory(value: string | undefined): SarkariCategory {
  const found = GOVT_CATEGORIES.find((item) => item.id === value);
  return found?.id ?? "jobs";
}
