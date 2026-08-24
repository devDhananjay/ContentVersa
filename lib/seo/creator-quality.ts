/**
 * P2 — Creator trust score for auto `adEligible` on moderation approve.
 * Computed from public author stats; no separate DB column.
 */

export type CreatorQualityStats = {
  publishedCount: number;
  rejectedCount: number;
  pendingCount: number;
  avgReadingTime: number;
  isVerified: boolean;
  warnings: number;
  banned: boolean;
};

export type CreatorQualityResult = {
  score: number;
  trusted: boolean;
  label: "Trusted" | "Established" | "New" | "At risk";
  reasons: string[];
};

export const CREATOR_TRUST_THRESHOLD = 70;

export function computeCreatorQuality(
  stats: CreatorQualityStats
): CreatorQualityResult {
  const reasons: string[] = [];
  if (stats.banned) {
    return { score: 0, trusted: false, label: "At risk", reasons: ["Account banned"] };
  }

  let score = 40;
  score += Math.min(stats.publishedCount * 4, 28);
  if (stats.publishedCount >= 5) reasons.push(`${stats.publishedCount} published posts`);
  if (stats.avgReadingTime >= 5) {
    score += 12;
    reasons.push("Strong average read time");
  } else if (stats.avgReadingTime >= 4) {
    score += 6;
  }
  if (stats.isVerified) {
    score += 12;
    reasons.push("Verified profile");
  }
  score -= stats.rejectedCount * 10;
  if (stats.rejectedCount > 0) {
    reasons.push(`${stats.rejectedCount} rejected submission(s)`);
  }
  score -= stats.warnings * 6;
  if (stats.warnings > 0) reasons.push(`${stats.warnings} warning(s)`);

  score = Math.max(0, Math.min(100, Math.round(score)));

  const trusted = score >= CREATOR_TRUST_THRESHOLD && stats.publishedCount >= 2;
  let label: CreatorQualityResult["label"] = "New";
  if (stats.rejectedCount >= 2 || stats.warnings >= 2) label = "At risk";
  else if (trusted) label = "Trusted";
  else if (stats.publishedCount >= 2) label = "Established";

  return { score, trusted, label, reasons };
}

/** Default ads-on-approve when moderator does not override. */
export function defaultAdEligibleOnApprove(input: {
  qualityOk: boolean;
  creator: CreatorQualityResult;
  moderatorOverride?: boolean;
}): boolean {
  if (!input.qualityOk) return false;
  if (typeof input.moderatorOverride === "boolean") return input.moderatorOverride;
  return input.creator.trusted;
}
