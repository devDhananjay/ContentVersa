import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Calculator,
  Car,
  Fuel,
  IndianRupee,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";

export type ToolSlug =
  | "ifsc-finder"
  | "pincode-finder"
  | "rto-finder"
  | "vehicle-plate-decoder"
  | "pan-gstin-checker"
  | "emi-calculator"
  | "sip-calculator"
  | "fuel-price";

export type ToolDef = {
  slug: ToolSlug;
  title: string;
  shortTitle: string;
  description: string;
  keywords: string[];
  icon: LucideIcon;
  badge?: string;
};

export const TOOLS_HUB_PATH = "/tools";

export const TOOL_REGISTRY: ToolDef[] = [
  {
    slug: "ifsc-finder",
    title: "IFSC Code Finder — Bank Branch Details India",
    shortTitle: "IFSC Finder",
    description:
      "Find bank name, branch address, MICR, and payment modes (NEFT, RTGS, IMPS, UPI) from any Indian IFSC code. Free lookup powered by Razorpay open data.",
    keywords: [
      "ifsc code finder",
      "ifsc lookup",
      "bank branch ifsc",
      "neft rtgs ifsc india",
    ],
    icon: Banknote,
    badge: "Banking",
  },
  {
    slug: "pincode-finder",
    title: "Pincode Finder — Post Office & Area Lookup India",
    shortTitle: "Pincode Finder",
    description:
      "Search any 6-digit Indian pincode to find post offices, district, state, and delivery status. Free India Post data.",
    keywords: ["pincode finder", "post office pincode", "area pincode india", "pin code search"],
    icon: MapPin,
    badge: "Address",
  },
  {
    slug: "rto-finder",
    title: "RTO Code Finder — Vehicle Registration Office India",
    shortTitle: "RTO Finder",
    description:
      "Search RTO codes by city or state. Find which Regional Transport Office issued a vehicle registration in India.",
    keywords: ["rto code finder", "rto office india", "vehicle rto code", "mh12 rto"],
    icon: Car,
    badge: "Vehicle",
  },
  {
    slug: "vehicle-plate-decoder",
    title: "Vehicle Number Plate Decoder — RTO & State India",
    shortTitle: "Plate Decoder",
    description:
      "Decode Indian vehicle registration numbers to identify state, RTO code, and BH Bharat series plates.",
    keywords: [
      "vehicle number decode",
      "number plate rto",
      "car registration state",
      "bh series plate",
    ],
    icon: Search,
    badge: "Vehicle",
  },
  {
    slug: "pan-gstin-checker",
    title: "PAN & GSTIN Format Checker India",
    shortTitle: "PAN / GSTIN Check",
    description:
      "Validate PAN and GSTIN number format instantly. Decode entity type, state code, and checksum — format check only, not live government verification.",
    keywords: ["pan validation", "gstin checker", "gstin format verify", "pan format india"],
    icon: ShieldCheck,
    badge: "Tax ID",
  },
  {
    slug: "emi-calculator",
    title: "EMI Calculator — Home & Car Loan India",
    shortTitle: "EMI Calculator",
    description:
      "Calculate monthly EMI, total interest, and total payment for home loans, car loans, and personal loans in India.",
    keywords: ["emi calculator", "home loan emi", "car loan emi india", "loan calculator"],
    icon: Calculator,
    badge: "Finance",
  },
  {
    slug: "sip-calculator",
    title: "SIP Calculator — Mutual Fund Returns India",
    shortTitle: "SIP Calculator",
    description:
      "Estimate mutual fund SIP maturity value, total invested amount, and expected returns over time.",
    keywords: ["sip calculator", "mutual fund sip", "sip returns india", "investment calculator"],
    icon: IndianRupee,
    badge: "Finance",
  },
  {
    slug: "fuel-price",
    title: "Petrol & Diesel Price by City India",
    shortTitle: "Fuel Price",
    description:
      "Check today's petrol and diesel prices by city across India. Updated daily from public fuel price data.",
    keywords: [
      "petrol price today",
      "diesel price india",
      "fuel price by city",
      "petrol rate today",
    ],
    icon: Fuel,
    badge: "Daily",
  },
];

export function getToolBySlug(slug: string): ToolDef | undefined {
  return TOOL_REGISTRY.find((t) => t.slug === slug);
}

export function toolPath(slug: ToolSlug): string {
  return `${TOOLS_HUB_PATH}/${slug}`;
}
