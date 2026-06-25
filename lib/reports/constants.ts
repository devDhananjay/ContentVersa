import type { ReportReason, ReportStatus, ReportTargetType } from "@prisma/client";

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  HATE_SPEECH: "Hate speech",
  MISINFORMATION: "Misinformation",
  INAPPROPRIATE: "Inappropriate content",
  OTHER: "Other",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: "Pending",
  DISMISSED: "Dismissed",
  ACTION_TAKEN: "Action taken",
};

export const REPORT_TARGET_LABELS: Record<ReportTargetType, string> = {
  BLOG: "Blog",
  COMMENT: "Comment",
  USER: "User",
  REEL: "Reel",
};

export const REPORT_REASONS = Object.keys(REPORT_REASON_LABELS) as ReportReason[];
