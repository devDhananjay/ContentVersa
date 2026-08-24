/**
 * P2 — Ad density control. Default `normal`; set NEXT_PUBLIC_AD_DENSITY=minimal
 * to reduce blog ad slots during UX/RPM experiments.
 */

export type AdDensity = "normal" | "minimal";

export function getAdDensity(): AdDensity {
  const raw = process.env.NEXT_PUBLIC_AD_DENSITY?.trim().toLowerCase();
  return raw === "minimal" ? "minimal" : "normal";
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
  return {
    afterCover: true,
    midArticle: true,
    afterContent: true,
    sidebar: true,
  };
}
