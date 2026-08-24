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
    pillarHref: "/tools/emi-calculator",
    pillarLabel: "EMI calculator",
    toolSlugs: ["emi-calculator", "fd-calculator", "rd-calculator", "salary-tax-calculator"],
    links: [
      { href: "/tools/emi-calculator", label: "EMI calculator" },
      { href: "/tools/fd-calculator", label: "FD calculator" },
      { href: "/tools/salary-tax-calculator", label: "Salary tax estimator" },
      { href: "/finance", label: "Finance hub" },
      { href: "/moneyverse", label: "MoneyVerse budgets" },
      { href: "/blogs?q=emi+loan", label: "Loan explainers" },
    ],
  },
  {
    id: "sip-investing",
    title: "SIP & long-term investing",
    description:
      "Project SIP growth, understand market risk, and pair investing with tax basics.",
    pillarHref: "/tools/sip-calculator",
    pillarLabel: "SIP calculator",
    toolSlugs: ["sip-calculator", "ppf-calculator", "fd-calculator"],
    links: [
      { href: "/tools/sip-calculator", label: "SIP calculator" },
      { href: "/tools/ppf-calculator", label: "PPF calculator" },
      { href: "/tools/fd-calculator", label: "FD calculator" },
      { href: "/finance", label: "Finance hub" },
      { href: "/guides", label: "India Guides" },
      { href: "/blogs?q=sip+mutual+fund", label: "SIP articles" },
    ],
  },
  {
    id: "banking-ifsc",
    title: "Banking basics (IFSC & transfers)",
    description:
      "Find IFSC codes, avoid transfer mistakes, and use related India utilities safely.",
    pillarHref: "/tools/ifsc-finder",
    pillarLabel: "IFSC finder",
    toolSlugs: ["ifsc-finder", "pan-gstin-checker", "pincode-finder"],
    links: [
      { href: "/tools/ifsc-finder", label: "IFSC finder" },
      { href: "/tools/pincode-finder", label: "Pincode finder" },
      { href: "/tools/pan-gstin-checker", label: "PAN / GSTIN checker" },
      { href: "/tools", label: "All India Tools" },
      { href: "/blogs?q=ifsc+neft", label: "Banking explainers" },
    ],
  },
  {
    id: "salary-tax",
    title: "Salary & income tax",
    description:
      "Compare old vs new tax regimes for planning — always verify on the official portal before filing.",
    pillarHref: "/tools/salary-tax-calculator",
    pillarLabel: "Salary tax calculator",
    toolSlugs: ["salary-tax-calculator", "gst-calculator", "sip-calculator"],
    links: [
      { href: "/tools/salary-tax-calculator", label: "Salary tax calculator" },
      { href: "/tools/gst-calculator", label: "GST calculator" },
      { href: "/tools/sip-calculator", label: "SIP calculator" },
      { href: "/moneyverse", label: "Expense tracker" },
      { href: "/blogs?q=income+tax", label: "Tax articles" },
    ],
  },
  {
    id: "gst-business",
    title: "GST for freelancers & small business",
    description:
      "Split invoice GST quickly, then file only on the official GST portal.",
    pillarHref: "/tools/gst-calculator",
    pillarLabel: "GST calculator",
    toolSlugs: ["gst-calculator", "pan-gstin-checker", "salary-tax-calculator"],
    links: [
      { href: "/tools/gst-calculator", label: "GST calculator" },
      { href: "/tools/pan-gstin-checker", label: "PAN / GSTIN checker" },
      { href: "/tools/salary-tax-calculator", label: "Salary tax calculator" },
      { href: "/guides/jobs", label: "Job guides" },
      { href: "/blogs?q=gst", label: "GST explainers" },
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
      { href: "/guides/jobs", label: "Job notification guides" },
      { href: "/jobs", label: "Jobs hub" },
      { href: "/results", label: "Sarkari results" },
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
      { href: "/tools/weather", label: "Weather" },
      { href: "/tools/pincode-finder", label: "Pincode finder" },
      {
        href: "/guides/schemes/fastag-india-eligibility-recharge-faq",
        label: "FASTag FAQ",
      },
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
