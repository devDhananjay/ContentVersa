/** Long-form how-to copy for AdSense-quality tool pages (India utilities). */

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

export type ToolGuide = {
  intro: string;
  sections: ToolGuideSection[];
  examples?: ToolGuideExample[];
  relatedLinks?: ToolGuideRelated[];
  /** Maps to YmylDisclaimer kind when set */
  ymylKind?: "finance" | "tax" | "schemes" | "general";
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
    examples: [
      {
        title: "Example — NEFT to a new vendor",
        body: "Ask the vendor for account name, number, and IFSC in one message. Paste IFSC into this finder to confirm bank + branch city matches their invoice letterhead before you send the first payment.",
      },
    ],
    relatedLinks: [
      { href: "/tools/pincode-finder", label: "Pincode finder" },
      { href: "/tools/pan-gstin-checker", label: "PAN / GSTIN checker" },
      { href: "/tools", label: "All India Tools" },
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
    examples: [
      {
        title: "Example — ₹10 lakh personal loan",
        body: "Principal ₹10,00,000 at 12% p.a. for 48 months lands near a mid-five-figure EMI. Shorten tenure to 36 months and EMI rises, but total interest falls — compare both totals, not only the monthly number.",
      },
      {
        title: "Example — stress-test a floating rate",
        body: "Re-run the same principal and tenure at +1% and +2% interest. If the higher EMI breaks your budget, negotiate a longer tenure or a smaller loan amount before you sign.",
      },
    ],
    relatedLinks: [
      { href: "/tools/fd-calculator", label: "FD calculator" },
      { href: "/tools/salary-tax-calculator", label: "Salary tax calculator" },
      { href: "/moneyverse", label: "MoneyVerse budgets" },
      { href: "/finance", label: "Finance hub" },
    ],
    ymylKind: "finance",
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
    examples: [
      {
        title: "Example — ₹5,000 monthly SIP for 10 years",
        body: "At an assumed 12% annualised return, a ₹5,000 SIP for 10 years invests ₹6 lakh in contributions while the projected corpus is materially higher — but a flat 12% path is only an illustration, not a promise.",
      },
      {
        title: "Example — compare horizons",
        body: "Keep the SIP amount fixed and toggle 5 vs 15 years. Longer horizons usually matter more than chasing last year’s top fund return assumption.",
      },
    ],
    relatedLinks: [
      { href: "/tools/ppf-calculator", label: "PPF calculator" },
      { href: "/tools/fd-calculator", label: "FD calculator" },
      { href: "/tools/emi-calculator", label: "EMI calculator" },
      { href: "/finance", label: "Finance hub" },
    ],
    ymylKind: "finance",
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
    examples: [
      {
        title: "Example — compare regimes with the same CTC",
        body: "Enter the same annual income twice: once assuming new-regime defaults, once with old-regime deductions you actually claim (80C, HRA, etc.). Pick the lower tax only after Form 16 / CA review.",
      },
    ],
    relatedLinks: [
      { href: "/tools/gst-calculator", label: "GST calculator" },
      { href: "/tools/sip-calculator", label: "SIP calculator" },
      { href: "/moneyverse", label: "Expense tracker" },
      { href: "/guides", label: "India Guides" },
    ],
    ymylKind: "tax",
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
    examples: [
      {
        title: "Example — ₹10,000 + 18% GST (exclusive)",
        body: "Base ₹10,000 at 18% adds ₹1,800 tax → invoice total ₹11,800. Inclusive mode does the reverse: from a ₹11,800 total, recover base and tax components.",
      },
    ],
    relatedLinks: [
      { href: "/tools/pan-gstin-checker", label: "PAN / GSTIN checker" },
      { href: "/tools/salary-tax-calculator", label: "Salary tax calculator" },
      { href: "/blogs?q=gst", label: "GST explainers" },
    ],
    ymylKind: "tax",
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
    examples: [
      {
        title: "Example — highway trip budget",
        body: "Estimate litres needed for your car’s km/l, multiply by today’s city petrol reading, then add 10–15% buffer for traffic and price differences between city and highway pumps.",
      },
    ],
    relatedLinks: [
      { href: "/tools/rto-finder", label: "RTO finder" },
      {
        href: "/guides/schemes/fastag-india-eligibility-recharge-faq",
        label: "FASTag guide",
      },
      { href: "/tools/weather", label: "Weather" },
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
  "fd-calculator": {
    intro:
      "A fixed deposit calculator estimates maturity value from principal, interest rate, and tenure. Banks publish their own compounding conventions — treat this as a planning estimate.",
    sections: [
      {
        heading: "How to compare FD offers",
        paragraphs: [
          "Match tenure and compounding (quarterly vs annual) before you compare two banks. Senior-citizen rates and premature withdrawal penalties change the real outcome.",
          "Laddering (splitting money across tenures) can balance liquidity and rate. This tool does not open an FD — complete booking on your bank’s official channel.",
        ],
        bullets: [
          "Confirm TDS rules if interest exceeds thresholds",
          "Check auto-renewal defaults so money is not locked unexpectedly",
          "Educational estimate only — not a bank offer",
        ],
      },
    ],
    examples: [
      {
        title: "Example — ₹2 lakh for 3 years",
        body: "Enter principal ₹2,00,000, your bank’s published rate, and 36 months. Note maturity value and total interest, then compare with a shorter tenure at a different rate.",
      },
    ],
    relatedLinks: [
      { href: "/tools/rd-calculator", label: "RD calculator" },
      { href: "/tools/ppf-calculator", label: "PPF calculator" },
      { href: "/tools/sip-calculator", label: "SIP calculator" },
      { href: "/finance", label: "Finance hub" },
    ],
    ymylKind: "finance",
  },
  "ppf-calculator": {
    intro:
      "The Public Provident Fund (PPF) calculator projects contributions and interest under PPF-like assumptions for planning. Official limits, interest rates, and lock-in rules are set by the government and can change.",
    sections: [
      {
        heading: "PPF planning basics",
        paragraphs: [
          "PPF is a long-horizon savings scheme with contribution caps and a multi-year lock-in. Use this calculator to visualise yearly contributions — then confirm the current rate and rules on official Post Office / bank PPF pages.",
          "Do not treat projected interest as guaranteed forever. Rates are reviewed periodically. This page is educational, not a subscription or account opening service.",
        ],
      },
    ],
    examples: [
      {
        title: "Example — ₹1.5 lakh yearly for 15 years",
        body: "Model the common annual contribution ceiling across a full PPF tenure to see how contributions and assumed interest combine — then verify today’s notified rate before you commit cashflow.",
      },
    ],
    relatedLinks: [
      { href: "/tools/sip-calculator", label: "SIP calculator" },
      { href: "/tools/fd-calculator", label: "FD calculator" },
      { href: "/tools/salary-tax-calculator", label: "Salary tax calculator" },
    ],
    ymylKind: "finance",
  },
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
