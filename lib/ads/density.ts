/**
 * Ad density — default `comfortable` = fewer early interruptions, natural breaks.
 * Set NEXT_PUBLIC_AD_DENSITY=minimal|normal|comfortable
 */

export type AdDensity = "comfortable" | "normal" | "minimal";

export function getAdDensity(): AdDensity {
  const raw = process.env.NEXT_PUBLIC_AD_DENSITY?.trim().toLowerCase();
  if (raw === "minimal" || raw === "normal" || raw === "comfortable") {
    return raw;
  }
  return "comfortable";
}

/** Blog page: which slots may render when adEligible. */
export function blogAdSlots(density: AdDensity = getAdDensity()) {
  if (density === "minimal") {
    return {
      afterCover: false,
      midArticle: false,
      afterContent: true,
      sidebar: false,
    };
  }
  if (density === "normal") {
    return {
      afterCover: true,
      midArticle: true,
      afterContent: true,
      sidebar: true,
    };
  }
  // comfortable (default): TOI-style ATF after cover + mid + end + one right rail
  return {
    afterCover: true,
    midArticle: true,
    afterContent: true,
    sidebar: true,
  };
}

/**
 * Movie detail: left + right skyscrapers (only one sticky) + mid bands.
 * Hero / watchlist CTAs stay ad-free.
 */
export function movieAdSlots(density: AdDensity = getAdDensity()) {
  if (density === "minimal") {
    return {
      leftRail: false,
      rightRail: true,
      afterCast: true,
      midMobile: false,
    };
  }
  // normal + comfortable: both gutters (long-height ads)
  return {
    leftRail: true,
    rightRail: true,
    afterCast: true,
    midMobile: true,
  };
}
