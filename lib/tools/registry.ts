export type ToolSlug =
  | "ifsc-finder"
  | "pincode-finder"
  | "rto-finder"
  | "vehicle-plate-decoder"
  | "pan-gstin-checker"
  | "fssai-checker"
  | "emi-calculator"
  | "sip-calculator"
  | "fuel-price"
  | "weather"
  | "currency-converter"
  | "age-calculator"
  | "qr-generator"
  | "barcode-generator"
  | "uuid-generator"
  | "indian-holidays"
  | "election-info"
  | "geo-location"
  | "nearby-places"
  | "nearby-hotels"
  | "nearby-restaurants"
  | "nearby-hospitals"
  | "nearby-schools"
  | "nearby-atms";

export type ToolDef = {
  slug: ToolSlug;
  title: string;
  shortTitle: string;
  description: string;
  keywords: string[];
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
    keywords: ["ifsc code finder", "ifsc lookup", "bank branch ifsc", "neft rtgs ifsc india"],
    badge: "Banking",
  },
  {
    slug: "pincode-finder",
    title: "Pincode Finder — Post Office & Area Lookup India",
    shortTitle: "Pincode Finder",
    description:
      "Search any 6-digit Indian pincode to find post offices, district, state, and delivery status. Free India Post data.",
    keywords: ["pincode finder", "post office pincode", "area pincode india", "pin code search"],
    badge: "Address",
  },
  {
    slug: "weather",
    title: "Weather Forecast by City India",
    shortTitle: "Weather",
    description:
      "Check current weather and 7-day forecast for any city in India — temperature, rain, wind, and humidity. Free, no sign-up.",
    keywords: ["weather india", "weather today city", "forecast india", "temperature delhi mumbai"],
    badge: "Daily",
  },
  {
    slug: "currency-converter",
    title: "Currency Converter — INR & World Rates",
    shortTitle: "Currency Converter",
    description:
      "Convert between INR and major world currencies with live mid-market rates. Free currency calculator for travel and remittance.",
    keywords: ["currency converter", "inr to usd", "forex converter india", "exchange rate today"],
    badge: "Finance",
  },
  {
    slug: "age-calculator",
    title: "Age Calculator — Exact Years Months Days",
    shortTitle: "Age Calculator",
    description:
      "Calculate exact age from date of birth in years, months, and days. Useful for forms, exams, and eligibility checks in India.",
    keywords: ["age calculator", "dob age calculator", "exact age years months days"],
    badge: "Utility",
  },
  {
    slug: "qr-generator",
    title: "QR Code Generator — Free Online",
    shortTitle: "QR Generator",
    description:
      "Generate a QR code from any text, URL, UPI ID, or Wi‑Fi string. Download as PNG instantly — free, no sign-up.",
    keywords: ["qr code generator", "upi qr generator", "free qr maker india"],
    badge: "Utility",
  },
  {
    slug: "barcode-generator",
    title: "Barcode Generator — CODE128 Free Online",
    shortTitle: "Barcode Generator",
    description:
      "Create printable CODE128 barcodes from any text or number. Useful for inventory, labels, and shop tags.",
    keywords: ["barcode generator", "code128 barcode", "barcode maker free"],
    badge: "Utility",
  },
  {
    slug: "uuid-generator",
    title: "UUID Generator — Free Online",
    shortTitle: "UUID Generator",
    description:
      "Generate random UUID v4 identifiers for apps, databases, and APIs. Copy one or many at once.",
    keywords: ["uuid generator", "guid generator", "uuid v4 online"],
    badge: "Dev",
  },
  {
    slug: "fssai-checker",
    title: "FSSAI License Format Checker India",
    shortTitle: "FSSAI Check",
    description:
      "Validate 14-digit FSSAI license / registration number format instantly. Format check only — live status on FoSCoS portal.",
    keywords: ["fssai license check", "fssai number verify", "food license format india"],
    badge: "Food",
  },
  {
    slug: "indian-holidays",
    title: "Indian Public Holidays Calendar",
    shortTitle: "Indian Holidays",
    description:
      "View public holidays in India for the current and next year — Republic Day, Diwali window references, and national holidays list.",
    keywords: ["indian holidays", "public holidays india", "national holidays calendar"],
    badge: "Calendar",
  },
  {
    slug: "election-info",
    title: "Voter ID & Election Info India",
    shortTitle: "Election Info",
    description:
      "Check EPIC / Voter ID format and find official Election Commission links to verify voter status, booth, and elections.",
    keywords: ["voter id check", "epic number format", "election commission india", "voter status"],
    badge: "Govt",
  },
  {
    slug: "geo-location",
    title: "Geo Location Finder — Lat Long & Address",
    shortTitle: "Geo Location",
    description:
      "Detect your current location (with permission) or look up latitude/longitude and reverse address. Free browser + OpenStreetMap data.",
    keywords: ["geo location", "lat long finder", "my location address india"],
    badge: "Maps",
  },
  {
    slug: "nearby-places",
    title: "Nearby Places Finder India",
    shortTitle: "Nearby Places",
    description:
      "Find hotels, restaurants, hospitals, schools, ATMs and more near you or any city using Google Places.",
    keywords: ["nearby places", "places near me india", "find nearby hotel hospital atm"],
    badge: "Maps",
  },
  {
    slug: "nearby-hotels",
    title: "Nearby Hotels Finder India",
    shortTitle: "Nearby Hotels",
    description: "Find hotels and lodging near your location or any Indian city.",
    keywords: ["hotels near me", "nearby hotels india", "find hotel by location"],
    badge: "Maps",
  },
  {
    slug: "nearby-restaurants",
    title: "Nearby Restaurants Finder India",
    shortTitle: "Nearby Restaurants",
    description: "Discover restaurants and cafes near you or around any city in India.",
    keywords: ["restaurants near me", "nearby food india", "find restaurants"],
    badge: "Maps",
  },
  {
    slug: "nearby-hospitals",
    title: "Nearby Hospitals Finder India",
    shortTitle: "Nearby Hospitals",
    description: "Locate hospitals and clinics near your location or city for emergencies and care.",
    keywords: ["hospitals near me", "nearby hospital india", "find clinic"],
    badge: "Maps",
  },
  {
    slug: "nearby-schools",
    title: "Nearby Schools Finder India",
    shortTitle: "Nearby Schools",
    description: "Find schools near any location or city across India.",
    keywords: ["schools near me", "nearby schools india", "find school"],
    badge: "Maps",
  },
  {
    slug: "nearby-atms",
    title: "Nearby ATMs Finder India",
    shortTitle: "Nearby ATMs",
    description: "Find cash ATMs near you or around any Indian city.",
    keywords: ["atm near me", "nearby atm india", "find atm"],
    badge: "Maps",
  },
  {
    slug: "rto-finder",
    title: "RTO Code Finder — Vehicle Registration Office India",
    shortTitle: "RTO Finder",
    description:
      "Search 1,200+ RTO codes by city or state with office address across India.",
    keywords: ["rto code finder", "rto office india", "vehicle rto code", "mh12 rto", "bareilly rto"],
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
    badge: "Vehicle",
  },
  {
    slug: "pan-gstin-checker",
    title: "PAN & GSTIN Format Checker India",
    shortTitle: "PAN / GSTIN Check",
    description:
      "Validate PAN and GSTIN number format instantly. Decode entity type, state code, and checksum — format check only, not live government verification.",
    keywords: ["pan validation", "gstin checker", "gstin format verify", "pan format india"],
    badge: "Tax ID",
  },
  {
    slug: "emi-calculator",
    title: "EMI Calculator — Home & Car Loan India",
    shortTitle: "EMI Calculator",
    description:
      "Calculate monthly EMI, total interest, and total payment for home loans, car loans, and personal loans in India.",
    keywords: ["emi calculator", "home loan emi", "car loan emi india", "loan calculator"],
    badge: "Finance",
  },
  {
    slug: "sip-calculator",
    title: "SIP Calculator — Mutual Fund Returns India",
    shortTitle: "SIP Calculator",
    description:
      "Estimate mutual fund SIP maturity value, total invested amount, and expected returns over time.",
    keywords: ["sip calculator", "mutual fund sip", "sip returns india", "investment calculator"],
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
    badge: "Daily",
  },
];

export function getToolBySlug(slug: string): ToolDef | undefined {
  return TOOL_REGISTRY.find((t) => t.slug === slug);
}

export function toolPath(slug: ToolSlug): string {
  return `${TOOLS_HUB_PATH}/${slug}`;
}
