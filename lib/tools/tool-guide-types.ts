/** Types for long-form tool guides (AdSense-quality editorial copy). */

export type ToolGuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ToolGuideExample = {
  title: string;
  body: string;
};

export type ToolGuideRelated = {
  href: string;
  label: string;
};

export type ToolGuideFaq = {
  q: string;
  a: string;
};

export type ToolGuide = {
  intro: string;
  sections: ToolGuideSection[];
  examples?: ToolGuideExample[];
  relatedLinks?: ToolGuideRelated[];
  /** Extra tool-specific Q&A (appended after the standard FAQ). */
  faqs?: ToolGuideFaq[];
  /** Maps to YmylDisclaimer kind when set */
  ymylKind?: "finance" | "tax" | "schemes" | "health" | "general";
};
