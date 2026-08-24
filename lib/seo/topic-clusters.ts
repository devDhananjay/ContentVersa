/** Hand-curated topic clusters for internal linking (P1 SEO). Not mass programmatic. */

export type TopicClusterLink = {
  href: string;
  label: string;
};

export type TopicCluster = {
  id: string;
  title: string;
  description: string;
  pillarHref: string;
  pillarLabel: string;
  /** Tool slugs that belong to this cluster */
  toolSlugs?: string[];
  links: TopicClusterLink[];
};

export const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    id: "fastag",
    title: "FASTag in India",
    description:
      "How FASTag works, who needs it, recharge options, and common highway toll questions.",
    pillarHref: "/guides/schemes/fastag-india-eligibility-recharge-faq",
    pillarLabel: "FASTag guide (pillar)",
    toolSlugs: ["fuel-price", "rto-finder"],
    links: [
      {
        href: "/guides/schemes/fastag-india-eligibility-recharge-faq",
        label: "FASTag eligibility & recharge FAQ",
      },
      {
        href: "/guides/money/highway-fuel-fastag-trip-planner",
        label: "Highway fuel + FASTag buffer",
      },
      { href: "/tools/fuel-price", label: "Fuel price checker" },
      { href: "/tools/rto-finder", label: "RTO code finder" },
      { href: "/guides/schemes", label: "More govt schemes" },
      { href: "/blogs?q=fastag", label: "FASTag articles" },
    ],
  },
  {
    id: "emi-loans",
    title: "EMI & personal loans",
    description:
      "Estimate EMI, compare tenure vs interest, and plan borrowing without sales pressure.",
    pillarHref: "/guides/money/emi-calculator-india-guide",
    pillarLabel: "EMI guide (pillar)",
    toolSlugs: ["emi-calculator", "fd-calculator", "rd-calculator", "salary-tax-calculator"],
    links: [
      { href: "/guides/money/emi-calculator-india-guide", label: "EMI guide" },
      {
        href: "/guides/money/credit-score-cibil-india-guide",
        label: "CIBIL / credit score",
      },
      {
        href: "/guides/money/gold-loan-vs-personal-loan-india",
        label: "Gold loan vs personal loan",
      },
      { href: "/tools/emi-calculator", label: "EMI calculator" },
      { href: "/tools/fd-calculator", label: "FD calculator" },
      { href: "/tools/salary-tax-calculator", label: "Salary tax estimator" },
    ],
  },
  {
    id: "sip-investing",
    title: "SIP & long-term investing",
    description:
      "Project SIP growth, understand market risk, and pair investing with tax basics.",
    pillarHref: "/guides/money/sip-calculator-india-beginners-guide",
    pillarLabel: "SIP guide (pillar)",
    toolSlugs: ["sip-calculator", "ppf-calculator", "fd-calculator"],
    links: [
      { href: "/guides/money/sip-calculator-india-beginners-guide", label: "SIP guide" },
      { href: "/guides/money/ppf-account-india-guide", label: "PPF account rules" },
      { href: "/guides/money/fd-vs-rd-india-guide", label: "FD vs RD" },
      { href: "/guides/money/when-to-stop-sip-mutual-fund", label: "When to pause a SIP" },
      { href: "/tools/sip-calculator", label: "SIP calculator" },
      { href: "/tools/ppf-calculator", label: "PPF calculator" },
    ],
  },
  {
    id: "banking-ifsc",
    title: "Banking basics (IFSC & transfers)",
    description:
      "Find IFSC codes, avoid transfer mistakes, and use related India utilities safely.",
    pillarHref: "/guides/money/ifsc-code-finder-india-guide",
    pillarLabel: "IFSC guide (pillar)",
    toolSlugs: ["ifsc-finder", "pan-gstin-checker", "pincode-finder"],
    links: [
      { href: "/guides/money/ifsc-code-finder-india-guide", label: "IFSC guide" },
      {
        href: "/guides/money/huid-hallmark-gold-buying-india",
        label: "HUID & hallmark gold",
      },
      { href: "/tools/ifsc-finder", label: "IFSC finder" },
      { href: "/tools/pincode-finder", label: "Pincode finder" },
      { href: "/tools/pan-gstin-checker", label: "PAN / GSTIN checker" },
      { href: "/tools", label: "All India Tools" },
    ],
  },
  {
    id: "salary-tax",
    title: "Salary & income tax",
    description:
      "Compare old vs new tax regimes for planning — always verify on the official portal before filing.",
    pillarHref: "/guides/money/salary-tax-calculator-india-guide",
    pillarLabel: "Salary tax guide (pillar)",
    toolSlugs: ["salary-tax-calculator", "gst-calculator", "sip-calculator"],
    links: [
      { href: "/guides/money/salary-tax-calculator-india-guide", label: "Salary tax guide" },
      {
        href: "/guides/money/hra-exemption-documents-india",
        label: "HRA exemption documents",
      },
      {
        href: "/guides/money/section-80c-elss-ppf-lic-india",
        label: "Section 80C options",
      },
      { href: "/tools/salary-tax-calculator", label: "Salary tax calculator" },
      { href: "/tools/gst-calculator", label: "GST calculator" },
      { href: "/tools/sip-calculator", label: "SIP calculator" },
    ],
  },
  {
    id: "gst-business",
    title: "GST for freelancers & small business",
    description:
      "Split invoice GST quickly, then file only on the official GST portal.",
    pillarHref: "/guides/money/gst-calculator-india-freelancers-guide",
    pillarLabel: "GST guide (pillar)",
    toolSlugs: ["gst-calculator", "pan-gstin-checker", "salary-tax-calculator"],
    links: [
      { href: "/guides/money/gst-calculator-india-freelancers-guide", label: "GST guide" },
      {
        href: "/guides/money/content-creator-tax-gst-india",
        label: "Creator tax & GST",
      },
      { href: "/tools/gst-calculator", label: "GST calculator" },
      { href: "/tools/pan-gstin-checker", label: "PAN / GSTIN checker" },
      { href: "/tools/salary-tax-calculator", label: "Salary tax calculator" },
      { href: "/guides/jobs", label: "Job guides" },
    ],
  },
  {
    id: "govt-schemes",
    title: "Government schemes",
    description:
      "Eligibility, documents, and how to apply — with clear educational disclaimers.",
    pillarHref: "/guides/schemes",
    pillarLabel: "Govt schemes hub",
    toolSlugs: [],
    links: [
      { href: "/guides/schemes", label: "Schemes hub" },
      {
        href: "/guides/schemes/fastag-india-eligibility-recharge-faq",
        label: "FASTag guide",
      },
      {
        href: "/guides/schemes/upi-fraud-otp-scam-india",
        label: "UPI fraud & OTP scams",
      },
      {
        href: "/guides/schemes/aadhaar-update-online-india",
        label: "Aadhaar update online",
      },
      {
        href: "/guides/schemes/pm-kisan-status-ekyc-pending",
        label: "PM-KISAN status & e-KYC",
      },
      { href: "/guides/jobs", label: "Job notification guides" },
    ],
  },
  {
    id: "travel-fuel",
    title: "Travel, fuel & RTO",
    description:
      "Plan trips with fuel context and public RTO code patterns — not private vehicle lookups.",
    pillarHref: "/tools/fuel-price",
    pillarLabel: "Fuel prices",
    toolSlugs: ["fuel-price", "rto-finder", "weather", "pincode-finder"],
    links: [
      { href: "/tools/fuel-price", label: "Fuel price" },
      { href: "/tools/rto-finder", label: "RTO finder" },
      {
        href: "/guides/money/highway-fuel-fastag-trip-planner",
        label: "Highway trip planner",
      },
      {
        href: "/guides/money/used-car-rc-rto-vahan-india",
        label: "Used car RC / Vahan",
      },
      {
        href: "/guides/schemes/fastag-india-eligibility-recharge-faq",
        label: "FASTag FAQ",
      },
      { href: "/tools/pincode-finder", label: "Pincode finder" },
    ],
  },
];

export function getTopicCluster(id: string): TopicCluster | undefined {
  return TOPIC_CLUSTERS.find((c) => c.id === id);
}

export function getTopicClusterForTool(slug: string): TopicCluster | undefined {
  return TOPIC_CLUSTERS.find((c) => c.toolSlugs?.includes(slug));
}

export function getTopicClusterLinks(
  cluster: TopicCluster,
  currentHref?: string,
  limit = 6
): TopicClusterLink[] {
  return cluster.links
    .filter((l) => !currentHref || l.href !== currentHref)
    .slice(0, limit);
}
