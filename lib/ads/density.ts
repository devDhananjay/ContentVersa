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
      /** YourStory-style 3×300×250 + 300×600 desktop rail */
      stackedRail: false,
      /** Mobile 320×50 masthead after cover */
      mobileTop: false,
      /** Extra in-article MRECs on mobile only */
      mobileExtraMids: false,
    };
  }
  if (density === "normal") {
    return {
      afterCover: true,
      midArticle: true,
      afterContent: true,
      sidebar: true,
      stackedRail: true,
      mobileTop: true,
      mobileExtraMids: true,
    };
  }
  // comfortable (default): ATF + mid + end + stacked right rail + mobile map
  return {
    afterCover: true,
    midArticle: true,
    afterContent: true,
    sidebar: true,
    stackedRail: true,
    mobileTop: true,
    mobileExtraMids: true,
  };
}

/**
 * Movie detail: left + right skyscrapers (only one sticky) + mid bands / MRECs.
 * Hero / watchlist CTAs stay ad-free.
 */
export function movieAdSlots(density: AdDensity = getAdDensity()) {
  if (density === "minimal") {
    return {
      leftRail: false,
      rightRail: true,
      afterCast: true,
      afterTrailer: false,
      afterStory: true,
      afterWhereToWatch: false,
      afterReviews: true,
      midMobile: false,
    };
  }
  // normal + comfortable: gutters + several in-content breaks
  return {
    leftRail: true,
    rightRail: true,
    afterCast: true,
    afterTrailer: true,
    afterStory: true,
    afterWhereToWatch: true,
    afterReviews: true,
    midMobile: true,
  };
}
