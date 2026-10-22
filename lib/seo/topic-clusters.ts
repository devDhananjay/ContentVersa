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
    toolSlugs: [
      "emi-calculator",
      "fd-calculator",
      "rd-calculator",
      "salary-tax-calculator",
    ],
    links: [
      { href: "/guides/money/emi-calculator-india-guide", label: "EMI guide" },
      {
        href: "/guides/money/personal-loan-eligibility-documents-india",
        label: "Personal loan eligibility",
      },
      {
        href: "/guides/money/credit-card-vs-personal-loan-india-2026",
        label: "Card vs personal loan 2026",
      },
      {
        href: "/guides/money/credit-card-rewards-vs-cashback-india-2026",
        label: "Rewards vs cashback cards",
      },
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
      { href: "/tools/rd-calculator", label: "RD calculator" },
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
    toolSlugs: ["sip-calculator", "ppf-calculator", "fd-calculator", "epf-calculator"],
    links: [
      { href: "/guides/money/sip-calculator-india-beginners-guide", label: "SIP guide" },
      { href: "/tools/sip-calculator", label: "SIP calculator" },
      { href: "/guides/money/sip-vs-fd-india-2026", label: "SIP vs FD 2026" },
      { href: "/guides/money/fd-vs-rd-india-guide", label: "FD vs RD" },
      { href: "/tools/fd-calculator", label: "FD calculator" },
      { href: "/guides/money/ppf-account-india-guide", label: "PPF account rules" },
      { href: "/tools/ppf-calculator", label: "PPF calculator" },
      { href: "/tools/epf-calculator", label: "EPF calculator" },
      { href: "/guides/money/epf-pf-withdrawal-rules-india", label: "EPF / PF withdrawal" },
      { href: "/guides/money/when-to-stop-sip-mutual-fund", label: "When to pause a SIP" },
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
    toolSlugs: [
      "salary-tax-calculator",
      "take-home-calculator",
      "term-cover-calculator",
      "gst-calculator",
      "sip-calculator",
    ],
    links: [
      { href: "/guides/money/salary-tax-calculator-india-guide", label: "Salary tax guide" },
      { href: "/tools/salary-tax-calculator", label: "Salary tax calculator" },
      {
        href: "/guides/money/old-vs-new-tax-regime-india-2026",
        label: "Old vs new tax regime 2026",
      },
      {
        href: "/guides/money/itr-filing-checklist-salaried-india",
        label: "ITR filing checklist",
      },
      { href: "/tools/take-home-calculator", label: "Take-home calculator" },
      {
        href: "/guides/money/term-insurance-beginners-india",
        label: "Term insurance beginners",
      },
      {
        href: "/guides/money/term-vs-endowment-insurance-india-2026",
        label: "Term vs endowment 2026",
      },
      {
        href: "/guides/money/health-insurance-india-beginners",
        label: "Health insurance beginners",
      },
      { href: "/tools/term-cover-calculator", label: "Term cover calculator" },
      {
        href: "/guides/money/hra-exemption-documents-india",
        label: "HRA exemption documents",
      },
      {
        href: "/guides/money/section-80c-elss-ppf-lic-india",
        label: "Section 80C options",
      },
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
    title: "Government schemes & ID checks",
    description:
      "Eligibility, documents, Voter ID / EPIC format help, and how to apply — with clear educational disclaimers.",
    pillarHref: "/guides/schemes",
    pillarLabel: "Govt schemes hub",
    toolSlugs: ["election-info", "pan-gstin-checker"],
    links: [
      { href: "/guides/schemes", label: "Schemes hub" },
      { href: "/tools/election-info", label: "Voter ID / EPIC check" },
      {
        href: "/guides/schemes/aadhaar-update-online-india",
        label: "Aadhaar update online",
      },
      { href: "/tools/pan-gstin-checker", label: "PAN / GSTIN checker" },
      {
        href: "/guides/schemes/fastag-india-eligibility-recharge-faq",
        label: "FASTag guide",
      },
      {
        href: "/guides/schemes/upi-fraud-otp-scam-india",
        label: "UPI fraud & OTP scams",
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
    toolSlugs: [
      "fuel-price",
      "rto-finder",
      "weather",
      "pincode-finder",
      "vehicle-plate-decoder",
    ],
    links: [
      { href: "/tools/fuel-price", label: "Fuel price" },
      { href: "/tools/rto-finder", label: "RTO finder" },
      { href: "/tools/weather", label: "Weather forecast" },
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
      { href: "/tools/vehicle-plate-decoder", label: "Vehicle plate decoder" },
    ],
  },
  {
    id: "pdf-docs",
    title: "PDF tools (browser-only)",
    description:
      "Merge, split, compress, or convert images to PDF on your device — files are not uploaded.",
    pillarHref: "/tools/merge-pdf",
    pillarLabel: "Merge PDF",
    toolSlugs: ["merge-pdf", "split-pdf", "compress-pdf", "images-to-pdf"],
    links: [
      { href: "/tools/merge-pdf", label: "Merge PDF" },
      { href: "/tools/split-pdf", label: "Split PDF" },
      { href: "/tools/compress-pdf", label: "Compress PDF" },
      { href: "/tools/images-to-pdf", label: "Images to PDF" },
      { href: "/tools/qr-generator", label: "QR generator" },
      { href: "/tools", label: "All India Tools" },
    ],
  },
  {
    id: "rail-travel",
    title: "Train travel utilities",
    description:
      "Validate PNR format and open trusted train enquiry links — always reconfirm on official railway sites.",
    pillarHref: "/tools/pnr-status",
    pillarLabel: "PNR status",
    toolSlugs: [
      "pnr-status",
      "train-running-status",
      "indian-holidays",
      "weather",
    ],
    links: [
      { href: "/tools/pnr-status", label: "PNR status helper" },
      { href: "/tools/train-running-status", label: "Train running status" },
      { href: "/tools/indian-holidays", label: "Indian holidays" },
      { href: "/tools/weather", label: "Weather" },
      { href: "/tools/currency-converter", label: "Currency converter" },
      { href: "/tools", label: "All India Tools" },
    ],
  },
  {
    id: "precious-metals",
    title: "Gold & silver rates",
    description:
      "Track indicative metal rates and learn hallmark / HUID checks before you buy jewellery.",
    pillarHref: "/goldverse",
    pillarLabel: "GoldVerse rates",
    toolSlugs: ["silver-rate", "currency-converter"],
    links: [
      { href: "/goldverse", label: "Live gold rates" },
      { href: "/tools/silver-rate", label: "Silver rate estimate" },
      { href: "/huid-verification", label: "HUID verification" },
      {
        href: "/guides/money/huid-hallmark-gold-buying-india",
        label: "HUID buying guide",
      },
      { href: "/tools/currency-converter", label: "Currency converter" },
      { href: "/guides/money", label: "Money guides" },
    ],
  },
  {
    id: "everyday-utils",
    title: "Everyday India utilities",
    description:
      "Quick free utilities for age, QR, barcodes, UUIDs, translation, and holidays.",
    pillarHref: "/tools",
    pillarLabel: "India Tools hub",
    toolSlugs: [
      "age-calculator",
      "qr-generator",
      "barcode-generator",
      "uuid-generator",
      "english-hindi-translator",
      "indian-holidays",
      "geo-location",
    ],
    links: [
      { href: "/tools/age-calculator", label: "Age calculator" },
      { href: "/tools/qr-generator", label: "QR generator" },
      { href: "/tools/barcode-generator", label: "Barcode generator" },
      { href: "/tools/english-hindi-translator", label: "English–Hindi translator" },
      { href: "/tools/indian-holidays", label: "Indian holidays" },
      { href: "/tools/uuid-generator", label: "UUID generator" },
      { href: "/tools", label: "All India Tools" },
    ],
  },
  {
    id: "nearby-places",
    title: "Nearby places",
    description:
      "Find hotels, restaurants, hospitals, schools, and ATMs near you or by city search.",
    pillarHref: "/tools/nearby-places",
    pillarLabel: "Nearby places",
    toolSlugs: [
      "nearby-places",
      "nearby-hotels",
      "nearby-restaurants",
      "nearby-hospitals",
      "nearby-schools",
      "nearby-atms",
      "geo-location",
    ],
    links: [
      { href: "/tools/nearby-places", label: "Nearby places" },
      { href: "/tools/nearby-hospitals", label: "Nearby hospitals" },
      { href: "/tools/nearby-hotels", label: "Nearby hotels" },
      { href: "/tools/nearby-restaurants", label: "Nearby restaurants" },
      { href: "/tools/nearby-atms", label: "Nearby ATMs" },
      { href: "/tools/geo-location", label: "My location" },
      { href: "/tools", label: "All India Tools" },
    ],
  },
  {
    id: "jobs",
    title: "Govt jobs & salary basics",
    description:
      "Read notifications carefully, understand payslips, and use official portals — never pay for a “guaranteed selection”.",
    pillarHref: "/jobs/govt",
    pillarLabel: "Govt jobs hub",
    toolSlugs: ["take-home-calculator", "salary-tax-calculator", "age-calculator"],
    links: [
      { href: "/jobs/govt", label: "Govt jobs hub" },
      {
        href: "/guides/jobs/ibps-banking-exam-salary-structure-india",
        label: "IBPS exam & salary structure",
      },
      {
        href: "/guides/jobs/ssc-salary-slip-how-to-read-india",
        label: "How to read an SSC salary slip",
      },
      { href: "/tools/take-home-calculator", label: "Take-home calculator" },
      { href: "/tools/salary-tax-calculator", label: "Salary tax calculator" },
      { href: "/guides/jobs", label: "Job guides" },
      { href: "/results", label: "Exam results directory" },
      {
        href: "/guides/money/salary-tax-calculator-india-guide",
        label: "Salary tax guide",
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
    // Keep equity on indexable tool hubs — never push thin location matrices.
    .filter((l) => !l.href.startsWith("/tools/locations/"))
    .slice(0, limit);
}
