/** Long-form how-to copy for AdSense-quality tool pages (India utilities). */

export type ToolGuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ToolGuide = {
  intro: string;
  sections: ToolGuideSection[];
};

const GUIDES: Partial<Record<string, ToolGuide>> = {
  "ifsc-finder": {
    intro:
      "IFSC (Indian Financial System Code) is an 11-character code that identifies every bank branch for NEFT, RTGS, and IMPS. Use this free IFSC finder when you need the correct branch code before transferring money — wrong IFSC can delay or bounce a transfer.",
    sections: [
      {
        heading: "How to find an IFSC code (step by step)",
        paragraphs: [
          "Start with the bank name, then narrow by state and city or search by branch. Confirm the 11-character code matches the passbook, cheque book, or net-banking details before you confirm a large transfer.",
          "IFSC format is always 4 letters (bank), 0, then 6 characters for the branch. Example patterns look like SBIN0001234. Never invent a code — always verify against a trusted source.",
        ],
        bullets: [
          "Use IFSC for NEFT / RTGS / IMPS and many UPI-linked bank setups",
          "Prefer bank SMS, passbook, or official net banking when available",
          "Double-check beneficiary name and account number along with IFSC",
        ],
      },
      {
        heading: "When Indians need IFSC most",
        paragraphs: [
          "Salary accounts, vendor payments, loan EMIs, mutual fund mandates, and tax refunds all rely on correct IFSC. Freelancers receiving client payments should keep their primary branch IFSC saved in Notes to avoid last-minute mistakes.",
          "This tool is a convenience utility for ContentVerse India readers. It is not a banking website. For disputes or official confirmation, contact your bank or use the bank’s official locator.",
        ],
      },
    ],
  },
  "pincode-finder": {
    intro:
      "India Post PIN codes help couriers, e-commerce checkouts, and government forms reach the right delivery office. This free pincode finder helps you look up locality and office information quickly.",
    sections: [
      {
        heading: "How to use the pincode finder",
        paragraphs: [
          "Search by area, city, or 6-digit PIN. Cross-check the result with India Post or your courier’s serviceability check before ordering high-value items.",
          "Some localities share nearby PIN codes or have multiple delivery offices. When in doubt, ask the seller or local post office which PIN to use for your building.",
        ],
      },
      {
        heading: "Why accurate PIN codes matter",
        paragraphs: [
          "Wrong PIN codes cause delayed deliveries, failed COD attempts, and KYC address mismatches on bank or SIM forms. Keep your home and office PIN codes saved for faster form fills.",
        ],
      },
    ],
  },
  "emi-calculator": {
    intro:
      "An EMI calculator helps you estimate monthly loan payments before you sign. Use it for home loans, car loans, personal loans, and consumer durables — then compare offers across banks.",
    sections: [
      {
        heading: "How EMI is calculated (plain English)",
        paragraphs: [
          "EMI depends on principal, annual interest rate, and tenure in months. Higher tenure lowers monthly EMI but increases total interest paid. Always compare total interest, not only EMI.",
          "Enter realistic rates from your bank’s sanction letter. Processing fees, insurance, and floating-rate resets are not always inside a simple EMI formula — ask the lender for an amortisation schedule.",
        ],
        bullets: [
          "Shorter tenure = higher EMI, lower total interest",
          "Prepayment can cut interest — check prepayment charges",
          "This tool is an estimate, not a loan offer",
        ],
      },
      {
        heading: "Practical tips for Indian borrowers",
        paragraphs: [
          "Keep EMI under a comfortable share of take-home salary (many planners suggest staying well below 40–50% including other EMIs). Stress-test a 1–2% rate hike if your loan is floating.",
          "Use ContentVerse India’s EMI calculator to compare scenarios side by side, then verify numbers with the bank before signing.",
        ],
      },
    ],
  },
  "sip-calculator": {
    intro:
      "A SIP (Systematic Investment Plan) calculator projects how monthly mutual fund investments can grow over time using an assumed annual return. It is for planning — not a guarantee of returns.",
    sections: [
      {
        heading: "How to use this SIP calculator",
        paragraphs: [
          "Enter monthly amount, expected annual return %, and tenure in years. Review both maturity value and estimated gains. Try conservative (8–10%), moderate (11–12%), and optimistic scenarios separately.",
          "Equity SIPs can be volatile year to year. Long horizons matter more than chasing last year’s top fund. This calculator assumes a constant return for simplicity.",
        ],
      },
      {
        heading: "SIP tips for beginners in India",
        paragraphs: [
          "Start with an amount you can continue for years. Automate via bank mandate. Increase SIP when salary rises. Review asset allocation annually — not every market headline.",
          "Mutual fund investments are subject to market risks. Read the scheme document and consult a SEBI-registered advisor if needed.",
        ],
      },
    ],
  },
  "salary-tax-calculator": {
    intro:
      "Estimate income tax under India’s new and old regimes for planning take-home salary. This is an independent educational calculator — not the Income Tax Department portal.",
    sections: [
      {
        heading: "How to estimate your tax",
        paragraphs: [
          "Enter annual CTC or taxable income and compare regimes. Include standard deduction assumptions shown in the tool. Section 87A rebates and surcharge rules can change — verify before filing.",
          "For exact liability, use the official e-filing utilities or a CA. Form 16, exemptions, HRA, and investments can change the final number.",
        ],
      },
      {
        heading: "New vs old regime — quick context",
        paragraphs: [
          "The new default regime uses revised slabs with fewer deductions. The old regime can still win if you have large eligible deductions. Run both numbers before choosing at filing time.",
        ],
      },
    ],
  },
  "gst-calculator": {
    intro:
      "GST calculator helps Indian businesses and freelancers split GST amount from invoice totals at common rates (5%, 12%, 18%, 28%). Useful for quotes and invoice checks.",
    sections: [
      {
        heading: "Exclusive vs inclusive GST",
        paragraphs: [
          "Exclusive: tax is added on top of the base amount. Inclusive: the total already contains GST and you reverse-calculate the base. Know which mode your invoice uses.",
          "This tool does not file GST returns. Use the GST portal for registration, GSTR filing, and official computations.",
        ],
      },
    ],
  },
  "fuel-price": {
    intro:
      "Check indicative petrol and diesel price context for Indian cities. Retail fuel prices move with global crude, INR exchange rates, and state taxes — treat on-site readings as informational planning aids, not a promise of tomorrow’s pump rate.",
    sections: [
      {
        heading: "How to read fuel prices",
        paragraphs: [
          "City-level prices can differ on the same day because of local taxes and dealer costs. Confirm the illuminated board at your pump before budgeting a long highway trip. CNG, ethanol blends, and EV charging are separate cost decisions — compare rupees per kilometre for your vehicle, not just litre prices.",
          "For fleet or delivery budgeting, track a weekly average rather than reacting to a single spike. Keep a small fuel buffer in your monthly cash plan during festival travel seasons.",
        ],
        bullets: [
          "Note petrol vs diesel separately — they do not always move together",
          "Highway pumps and city pumps can differ; plan stops accordingly",
          "This page is not an Oil Marketing Company portal",
        ],
      },
    ],
  },
  weather: {
    intro:
      "Local weather helps with commute, travel, school plans, and outdoor work. Our weather tool uses location or city search to show current conditions and outlook context for Indian users.",
    sections: [
      {
        heading: "Tips for accurate weather",
        paragraphs: [
          "Allow location for nearby conditions, or search your city name carefully (many Indian towns share similar spellings). Forecasts update frequently — recheck before monsoon travel, outdoor events, or early-morning flights.",
          "Heatwave and heavy-rain alerts from official meteorological sources take priority over any consumer widget. Use this tool for everyday planning; use IMD / local administration guidance for severe weather decisions.",
        ],
        bullets: [
          "Recheck the evening before an outdoor shoot or wedding function",
          "Wind and humidity matter for comfort as much as temperature",
          "VPN or wrong location permissions can show another city — verify the label",
        ],
      },
    ],
  },
  "rto-finder": {
    intro:
      "RTO codes appear on number plates and help identify the registering authority. Use this finder to understand state/RTO code patterns — not to look up private owner data.",
    sections: [
      {
        heading: "What this tool can and cannot do",
        paragraphs: [
          "You can decode public RTO code patterns used across Indian registration marks. Owner name, address, phone, or full challan history require official Parivahan / Vahan services with proper authentication — we do not provide private vehicle-owner lookup.",
          "Buyers verifying a used car should still insist on official history checks, insurance validity, and physical inspection. An RTO code alone never proves ownership or hypothecation status.",
        ],
        bullets: [
          "Useful for learning state series patterns and general geography of codes",
          "Not a substitute for RC verification on official portals",
          "Report scraped “owner details” sites — they are often unsafe or illegal",
        ],
      },
    ],
  },
  "currency-converter": {
    intro:
      "Convert between INR and major world currencies for travel, freelancing invoices, and imports. Mid-market rates move through the day — confirm with your bank, card issuer, or remittance provider for final settlement.",
    sections: [
      {
        heading: "Using FX rates wisely",
        paragraphs: [
          "Card networks and banks add markup over mid-market rates. Airport counters are often expensive. For large transfers, compare bank TT rates, documented remittance apps, and timing (avoid converting in a panic the night before travel).",
          "Freelancers invoicing in USD/EUR should decide whether quotes are mid-market or include a buffer for FX and platform fees. Keep a simple sheet of invoice date vs credited INR to learn your real effective rate.",
        ],
        bullets: [
          "This converter is for quick estimates, not bank settlement",
          "Watch weekend and holiday liquidity for large conversions",
          "Enable transaction alerts on cards used abroad",
        ],
      },
    ],
  },
};

export function getToolGuide(slug: string): ToolGuide | null {
  return GUIDES[slug] ?? null;
}
