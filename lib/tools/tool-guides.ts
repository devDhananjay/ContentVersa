/** Long-form how-to copy for AdSense-quality tool pages (India utilities). */
import type { ToolGuide } from "./tool-guide-types";
import { FINANCE_GUIDES } from "./guides/finance-guides";
import { LOOKUP_GUIDES } from "./guides/lookup-guides";
import { UTILITY_GUIDES } from "./guides/utility-guides";

export type {
  ToolGuide,
  ToolGuideSection,
  ToolGuideExample,
  ToolGuideRelated,
  ToolGuideFaq,
} from "./tool-guide-types";

const GUIDES: Partial<Record<string, ToolGuide>> = {
  ...FINANCE_GUIDES,
  ...LOOKUP_GUIDES,
  ...UTILITY_GUIDES,
  "election-info": {
    intro:
      "Your Voter ID card (EPIC — Electors Photo Identity Card) is the primary proof that your name is on India’s electoral roll. Use this free EPIC format checker to confirm the number looks valid, pick your state or union territory, then finish the official search on the Election Commission of India (ECI) portal. Live name, booth, and status details are only available after you complete CAPTCHA on ECI’s site.",
    sections: [
      {
        heading: "What is an EPIC / Voter ID number?",
        paragraphs: [
          "EPIC is a unique ID printed on your Voter ID card. In most states the common pattern is three letters followed by seven digits (10 characters total) — for example ABC1234567. Older or special-series cards can look slightly different; if format check fails, still verify on the official electoral search with the exact spelling from your card.",
          "EPIC is not the same as Aadhaar, PAN, or passport. Banks and employers may ask for Voter ID as address or identity proof, but electoral status (whether you can vote in a constituency) is controlled only through ECI rolls.",
        ],
        bullets: [
          "Typical format: 3 letters + 7 digits (e.g. ZYH2024206)",
          "Ignore spaces or hyphens when typing — this tool strips them",
          "Always match the EPIC printed on your physical or e-EPIC card",
        ],
      },
      {
        heading: "How to check your name in the voter list (official way)",
        paragraphs: [
          "Enter your EPIC here to validate format, select the state or UT where you are enrolled, then open electoralsearch.eci.gov.in. On the ECI page choose Search by EPIC, enter the same number and state, solve the CAPTCHA, and submit. Results can show constituency, part number, serial number, and polling station context when your record is found.",
          "You can also use voters.eci.gov.in for services such as forms, e-EPIC download, and application tracking. Helpline 1950 and the Voter Helpline app are official alternatives if the website is busy during elections.",
        ],
        bullets: [
          "Use Search by EPIC when you already know your Voter ID number",
          "Use Search by Details if you forgot EPIC but know name, age, and relative’s name",
          "SMS: send ECI followed by your EPIC number to 1950 (add STD code when calling 1950)",
        ],
      },
      {
        heading: "Why CAPTCHA is required on ECI",
        paragraphs: [
          "The public electoral-search portal protects citizen data with CAPTCHA and other controls. ContentVerse India does not bypass CAPTCHA, scrape private ECI gateways, or store your EPIC for live lookup. We help you validate format and reach the correct official page faster.",
          "If search returns no record, check spelling of EPIC, try the correct state, or search by personal details. You may need Form 6 (new registration), Form 8 (correction / shifting), or Form 7 (objection) via the Voters’ Services Portal.",
        ],
      },
      {
        heading: "Common mistakes to avoid",
        paragraphs: [
          "Mixing up state of enrolment with current city of residence is a frequent miss — search with the state printed on your EPIC. Also avoid typing letter O vs digit 0 incorrectly; copy carefully from the card.",
          "Never share OTP, password, or scanned Voter ID on social media or with unverified “agents” promising booth change. Official services do not ask for fees to “fast-track” enrolment.",
        ],
        bullets: [
          "Confirm state / UT matches your electoral roll entry",
          "Prefer official ECI / NVSP links over random WhatsApp tools",
          "Keep a photo of both sides of your EPIC for form fills",
        ],
      },
    ],
    examples: [
      {
        title: "Example — format check before ECI search",
        body: "You have EPIC ZYH2024206 and enrolment in Uttar Pradesh. Paste the EPIC into this tool (spaces are removed), select Uttar Pradesh, confirm the green format message, then open electoralsearch.eci.gov.in → Search by EPIC → enter the same values → solve CAPTCHA → Search.",
      },
      {
        title: "Example — forgot EPIC number",
        body: "If the card is lost, open the ECI electoral search “Search by Details” tab with name, relative’s name, age/DOB, and state, or use voters.eci.gov.in / Voter Helpline app to track and download e-EPIC after authentication.",
      },
    ],
    relatedLinks: [
      { href: "/tools/pan-gstin-checker", label: "PAN / GSTIN checker" },
      { href: "/tools/pincode-finder", label: "Pincode finder" },
      { href: "/tools/age-calculator", label: "Age calculator" },
      { href: "/guides/schemes/aadhaar-update-online-india", label: "Aadhaar update guide" },
      { href: "/guides/schemes", label: "Govt schemes hub" },
      { href: "/tools", label: "All India Tools" },
    ],
    ymylKind: "schemes",
  },
};

export function getToolGuide(slug: string): ToolGuide | null {
  return GUIDES[slug] ?? null;
}
