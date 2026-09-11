/**
 * Deep pillar guides for topic clusters — richer copy + FAQ for Google ranking.
 */
import type { GuideArticle } from "./registry";

export const PILLAR_GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: "fastag-india-eligibility-recharge-faq",
    section: "schemes",
    title: "FASTag in India — Eligibility, Buy, Recharge & Common FAQ (2026)",
    shortTitle: "FASTag guide",
    description:
      "Complete FASTag guide for India: who needs it, how to buy and activate, recharge via UPI, blacklist fixes, double-toll disputes, and NHAI/IHMCL safety tips — updated Aug 2026.",
    keywords: [
      "fastag india",
      "fastag recharge",
      "fastag eligibility",
      "how to buy fastag",
      "fastag blacklist",
      "nhai fastag",
      "fastag not working",
      "fastag double deduction",
      "ihmcl fastag",
      "fastag for two wheeler",
    ],
    readingMinutes: 14,
    updatedLabel: "Aug 2026",
    relatedHref: "/tools/fuel-price",
    relatedLabel: "Check fuel prices",
    clusterId: "fastag",
    faqs: [
      {
        q: "Is FASTag mandatory in India?",
        a: "On most national highway toll plazas, FASTag is the expected payment method. Cash lanes may charge a higher fee or be limited. Rules can change — confirm on NHAI / IHMCL channels for your route.",
      },
      {
        q: "How do I recharge FASTag?",
        a: "Use your issuer bank’s app, net banking, or UPI linked to the FASTag wallet. After payment, wait a few minutes and verify the balance in the issuer app before a long trip.",
      },
      {
        q: "Why is my FASTag blacklisted?",
        a: "Common reasons: low or zero balance, KYC pending, mismatched vehicle number, or issuer-side holds. Top up, complete KYC in the issuer app, then wait for the blacklist to clear (can take hours).",
      },
      {
        q: "Can one FASTag be used on two vehicles?",
        a: "No. One FASTag is typically mapped to one registration number. Affixing the same tag on another vehicle can cause failed reads or account issues.",
      },
      {
        q: "What if the plaza deducted twice?",
        a: "Note plaza name, time, lane, and SMS. Raise a dispute with your FASTag issuer first with screenshots. Keep the toll receipt if any cash fallback was used.",
      },
    ],
    blocks: [
      {
        heading: "What FASTag is (and why highways need it)",
        paragraphs: [
          "FASTag is an RFID sticker linked to a prepaid wallet or bank account. Toll plazas on many national highways scan the tag so vehicles can pass without cash queues. The system is run through NHAI / IHMCL frameworks with bank and payment partners — issuer rules and fees can differ.",
          "Cars, commercial vehicles, and many two-wheelers on notified stretches are expected to use FASTag. Driving without a working tag can mean higher cash toll or penalties depending on plaza policy. Treat this page as an educational explainer; always confirm live rules on official portals before you buy or travel.",
        ],
      },
      {
        heading: "Who needs FASTag (eligibility in plain English)",
        paragraphs: [
          "If you use national highways regularly — weekend trips, interstate office travel, logistics, taxis, or intercity buses — FASTag usually saves time and avoids cash-lane delays. Occasional city-only drivers may still want one for rare highway journeys so they are not stuck at a plaza without a working tag.",
          "You generally need a valid vehicle registration (RC), a mobile number for OTP/alerts, and a bank account or wallet supported by an authorised FASTag issuer. Commercial fleets often manage multiple tags under a business account — check your issuer’s fleet product separately.",
        ],
        bullets: [
          "Keep RC details ready when activating (registration number must match)",
          "Affix the tag on the windscreen exactly as the issuer instructs — wrong placement fails reads",
          "One FASTag maps to one vehicle registration in normal retail use",
          "Two-wheeler FASTag availability depends on issuer and plaza network — confirm before you buy",
        ],
      },
      {
        heading: "How to buy and activate FASTag",
        paragraphs: [
          "You can usually buy FASTag from participating banks, authorised Point of Sale (POS) locations, or bank apps/websites that list FASTag products. Prefer well-known bank issuers over unknown roadside sellers who ask for OTP or remote access to your phone.",
          "Activation links the tag ID to your vehicle number and a wallet or account. Complete KYC when asked (PAN/Aadhaar as required by the issuer). After activation, do a small test recharge and confirm the vehicle number shown in the app matches your RC before your first long highway trip.",
        ],
        bullets: [
          "Buy only from banks / authorised POS listed by NHAI–IHMCL partners",
          "Photograph the tag ID and keep the welcome SMS",
          "Never share banking OTP to “activate FASTag” over WhatsApp",
        ],
      },
      {
        heading: "How to recharge FASTag (UPI, app, net banking)",
        paragraphs: [
          "Recharge via the issuer’s app, UPI, or net banking. Set a low-balance alert so you are not stuck with a declined plaza read. After recharge, wait a few minutes and confirm balance in the issuer app — some wallets take a short settlement delay.",
          "Before a long trip (especially festival weekends), top up with a buffer above your expected tolls. Combine this with a fuel budget using ContentVerse India’s fuel price tool so cashflow surprises stay low.",
        ],
        bullets: [
          "Enable SMS / push alerts for every plaza debit",
          "Keep a second payment method ready if your tag fails at a plaza",
          "Avoid third-party “instant recharge agents” that ask for OTP",
        ],
      },
      {
        heading: "FASTag not working, blacklist, or double deduction",
        paragraphs: [
          "If a plaza does not open: slow down safely, note plaza name, time, and lane, and check SMS. Common fixes — low balance top-up, wait for blacklist clear after KYC, re-affix tag if the windscreen film blocks RFID, or ask staff for the FASTag lane policy at that plaza.",
          "If charged twice or charged while cash was also taken, raise a dispute with your issuer with screenshots and timestamps. Official blacklist / KYC status lives with your bank issuer and NHAI–IHMCL support channels — ContentVerse India does not process disputes.",
        ],
        bullets: [
          "Screenshot failed transactions before leaving the plaza area if safe",
          "Dispute first with the issuer app / helpline, not random social accounts",
          "Pair trip planning with fuel estimates on our Fuel Price tool",
        ],
      },
      {
        heading: "Documents & checklist before a highway trip",
        paragraphs: [
          "A five-minute checklist prevents most FASTag failures: confirm balance, confirm vehicle number in the app, confirm tag is affixed correctly, and save issuer helpline numbers offline. If you changed the windscreen recently, re-validate the tag — RFID placement is easy to get wrong after glass work.",
        ],
        bullets: [
          "Balance ≥ expected tolls + buffer",
          "RC number matches app",
          "Phone has network for OTP if issuer asks mid-trip",
          "Alternate cash/UPI plan if plaza has issues",
        ],
      },
    ],
  },
  {
    slug: "emi-calculator-india-guide",
    section: "money",
    title: "EMI Calculator India — How Loan EMIs Work (Home, Car & Personal)",
    shortTitle: "EMI guide",
    description:
      "Understand EMI in India: formula in plain English, tenure vs interest trade-offs, floating-rate stress tests, and how to use our free EMI calculator before you sign.",
    keywords: [
      "emi calculator india",
      "home loan emi",
      "personal loan emi",
      "how emi is calculated",
      "loan tenure vs interest",
      "floating rate emi",
    ],
    readingMinutes: 12,
    updatedLabel: "Aug 2026",
    relatedHref: "/tools/emi-calculator",
    relatedLabel: "Open EMI calculator",
    clusterId: "emi-loans",
    faqs: [
      {
        q: "How is EMI calculated?",
        a: "EMI depends on principal, annual interest rate, and tenure in months. Higher tenure lowers monthly EMI but usually increases total interest paid. Always compare total interest, not only the monthly number.",
      },
      {
        q: "Should I choose a longer tenure to reduce EMI?",
        a: "Only if the lower EMI fits your budget after stress-testing a rate hike. Longer tenure often means more total interest. Run 36 vs 48 vs 60 month scenarios in the calculator before you sign.",
      },
      {
        q: "Is this calculator a loan offer?",
        a: "No. ContentVerse India’s EMI tool is an educational estimate. Bank processing fees, insurance, and floating-rate resets may not be inside a simple EMI formula — verify with the lender’s amortisation schedule.",
      },
    ],
    blocks: [
      {
        heading: "What EMI means for Indian borrowers",
        paragraphs: [
          "EMI (Equated Monthly Instalment) is the fixed amount you pay each month toward a loan — part interest, part principal. Home loans, car loans, personal loans, and many consumer durables use EMI structures. Understanding the trade-off between monthly comfort and total interest is the real skill, not just finding the lowest advertised EMI.",
          "Use our free EMI calculator to compare scenarios side by side, then verify numbers with the bank before signing. This guide is educational only — not a loan offer or credit advice.",
        ],
      },
      {
        heading: "EMI formula in plain English",
        paragraphs: [
          "EMI rises when principal or interest rate rises, and falls when tenure lengthens. A longer tenure spreads principal over more months, so the monthly hit looks smaller — but interest accumulates for longer. Always ask for total interest payable and the amortisation schedule, not only the EMI line on a sales flyer.",
        ],
        bullets: [
          "Shorter tenure = higher EMI, usually lower total interest",
          "Floating rates can change EMI or tenure mid-loan",
          "Processing fees and insurance may sit outside the EMI",
        ],
      },
      {
        heading: "Practical planning tips before you borrow",
        paragraphs: [
          "Keep total EMIs (existing + new) under a comfortable share of take-home salary. Stress-test a 1–2% rate hike if the loan is floating. Prepayment can cut interest — check prepayment charges and whether the bank reduces tenure or EMI after you prepay.",
          "Compare bank offers with the same principal and tenure in our calculator, then confirm with Form 16 / salary slips the lender will underwrite against.",
        ],
      },
      {
        heading: "First home-loan checklist (salaried)",
        paragraphs: [
          "Before you sign: list take-home pay, existing EMIs, and a 6-month emergency buffer. Stress-test a 1–2% floating-rate hike. Keep processing fees, insurance, and prepayment charges out of the “lowest EMI” screenshot. If two lenders quote similar EMIs, pick the clearer foreclosure rules — not the flashier app.",
        ],
        bullets: [
          "Same principal + tenure when you compare offers",
          "Ask whether prepayment cuts EMI or tenure",
          "This is not a loan offer — verify the bank’s KFS / MITC",
        ],
      },
      {
        heading: "Worked example you can recreate",
        paragraphs: [
          "Take ₹10 lakh at 12% p.a. for 48 months and note EMI and total interest. Then switch to 36 months: EMI rises, total interest usually falls. That comparison is more useful than any single “lowest EMI” screenshot from a marketplace ad.",
        ],
      },
    ],
  },
  {
    slug: "sip-calculator-india-beginners-guide",
    section: "money",
    title: "SIP Calculator India — Beginner Guide to Systematic Investing",
    shortTitle: "SIP guide",
    description:
      "SIP explained for India: how monthly mutual fund investments work, how to read calculator projections, risk disclaimers, and beginner habits that stick.",
    keywords: [
      "sip calculator india",
      "sip for beginners",
      "systematic investment plan",
      "mutual fund sip",
      "sip vs lumpsum",
      "sip returns explained",
    ],
    readingMinutes: 14,
    updatedLabel: "Sept 2026",
    relatedHref: "/tools/sip-calculator",
    relatedLabel: "Open SIP calculator",
    clusterId: "sip-investing",
    faqs: [
      {
        q: "Does a SIP guarantee returns?",
        a: "No. SIP calculators assume a constant return for illustration. Equity and hybrid funds can be volatile year to year. Mutual fund investments are subject to market risks.",
      },
      {
        q: "How much should I start a SIP with?",
        a: "Start with an amount you can continue for years without breaking household cashflow. Automate via bank mandate and increase when salary rises.",
      },
      {
        q: "SIP vs FD — which is better?",
        a: "They solve different problems. FDs prioritise predictable rupee outcomes (issuer risk aside); SIPs in market-linked funds prioritise long-horizon growth with volatility. Many households use both — this is not personalised advice.",
      },
      {
        q: "Is SIP always safer than lumpsum?",
        a: "SIP reduces timing stress; market risk remains. A lumpsum of bonus money can still be staged over a few months if your emergency fund is ready. Safety comes from allocation and horizon, not the SIP label.",
      },
    ],
    blocks: [
      {
        heading: "What a SIP is (without jargon)",
        paragraphs: [
          "A Systematic Investment Plan (SIP) invests a fixed amount into a mutual fund at regular intervals — usually monthly. The habit matters as much as the product: automation reduces the urge to time the market on every headline.",
          "Our SIP calculator projects how monthly investments might grow under an assumed annual return. It is for planning conversations — not a guarantee and not SEBI-registered advice.",
        ],
      },
      {
        heading: "How to use the SIP calculator well",
        paragraphs: [
          "Enter monthly amount, expected annual return %, and tenure in years. Review maturity value and estimated gains. Try conservative (8–10%), moderate (11–12%), and optimistic scenarios separately instead of one aggressive number.",
          "Long horizons usually matter more than chasing last year’s top fund. Revisit asset allocation annually — not every market dip.",
        ],
      },
      {
        heading: "Beginner habits that actually stick",
        paragraphs: [
          "Automate the SIP on salary day. Keep an emergency buffer in safer instruments so you do not pause SIPs for every expense spike. Read the scheme document. If you need personalised advice, consult a SEBI-registered adviser.",
        ],
        bullets: [
          "Start small, stay consistent",
          "Increase SIP with salary hikes",
          "Do not confuse past returns with future results",
        ],
      },
      {
        heading: "Worked examples: ₹1,000 / ₹5,000 / ₹10,000 a month",
        paragraphs: [
          "Use the calculator twice: once at a conservative assumed return (around 8–10%) and once at a moderate one (around 11–12%). A ₹1,000 SIP is a habit starter; ₹5,000 is a common salaried step-up; ₹10,000 is meaningful only if the emergency fund and EMIs are already stable. The rupee gap after 10–15 years is usually larger than people expect — that is compounding plus time, not a promised rate.",
          "These figures are illustrations inside our tool, not forecasts. Markets can be flat or negative for years. Raise the SIP when take-home pay rises rather than chasing last year’s top fund.",
        ],
      },
      {
        heading: "SIP vs lumpsum (when a bonus arrives)",
        paragraphs: [
          "SIP optimises for monthly cash-flow and reduces the urge to time the market. A lumpsum can make sense for a bonus, matured FD, or inheritance that would otherwise sit idle — if the emergency fund is already funded and the horizon is long. Dumping everything on an all-time-high headline is the usual behavioural failure.",
          "A practical hybrid for many salaried households: keep the SIP running, and stagger windfalls over 3–6 months into the same asset-allocation plan. Rebalance yearly. Educational only — not a recommendation.",
        ],
      },
      {
        heading: "Common mistakes to avoid",
        paragraphs: [
          "Pausing SIPs after one bad month, investing money you need within two years, and ignoring expense ratios / direct vs regular plans are more damaging than picking the “wrong” popular large-cap. Do not treat a calculator maturity number as guaranteed corpus for a home down-payment next year.",
        ],
      },
    ],
  },
  {
    slug: "ifsc-code-finder-india-guide",
    section: "money",
    title: "IFSC Code Finder India — NEFT, RTGS & IMPS Without Mistakes",
    shortTitle: "IFSC guide",
    description:
      "Find and verify IFSC codes in India: 11-character format, when you need IFSC, how to avoid wrong transfers, and how to use our free IFSC finder safely.",
    keywords: [
      "ifsc code finder",
      "ifsc code india",
      "neft ifsc",
      "wrong ifsc transfer",
      "bank branch ifsc",
    ],
    readingMinutes: 10,
    updatedLabel: "Aug 2026",
    relatedHref: "/tools/ifsc-finder",
    relatedLabel: "Open IFSC finder",
    clusterId: "banking-ifsc",
    faqs: [
      {
        q: "What does an IFSC look like?",
        a: "IFSC is 11 characters: 4 letters for the bank, a 0, then 6 characters for the branch (example pattern: SBIN0001234). Never invent a code — verify against passbook, cheque, or the bank’s official locator.",
      },
      {
        q: "I sent money with the wrong IFSC — what now?",
        a: "Contact your bank immediately with UTR/reference number. Recovery depends on whether the credit succeeded and bank processes. Prevention (double-check before send) is far easier than reversal.",
      },
      {
        q: "Is ContentVerse a bank?",
        a: "No. Our IFSC finder is a convenience utility. For disputes or official confirmation, use your bank or the bank’s official branch locator.",
      },
    ],
    blocks: [
      {
        heading: "Why IFSC matters",
        paragraphs: [
          "IFSC (Indian Financial System Code) identifies every bank branch for NEFT, RTGS, and IMPS. Wrong IFSC can delay or bounce a transfer — or, in worst cases, credit the wrong branch path and create a recovery headache.",
          "Salary accounts, vendor payments, loan EMIs, mutual fund mandates, and tax refunds all rely on correct IFSC. Freelancers should keep their primary branch IFSC saved in a trusted notes app.",
        ],
      },
      {
        heading: "How to find IFSC safely",
        paragraphs: [
          "Start with bank name, then narrow by state and city, or search by branch. Cross-check against passbook, cheque book, or net banking. Prefer official bank SMS and statements for high-value first-time payees.",
        ],
        bullets: [
          "Match beneficiary name + account number + IFSC together",
          "Send a ₹1 test transfer to new vendors when practical",
          "Avoid random websites that ask for OTP to “verify IFSC”",
        ],
      },
      {
        heading: "NEFT vs IMPS vs RTGS (quick context)",
        paragraphs: [
          "IMPS is typically for faster smaller transfers; NEFT/RTGS cover broader bank settlement use-cases and amount bands. Exact limits and timings change — confirm in your banking app before a time-critical payment.",
        ],
      },
    ],
  },
  {
    slug: "salary-tax-calculator-india-guide",
    section: "money",
    title: "Salary Tax Calculator India — New vs Old Regime Explained",
    shortTitle: "Salary tax guide",
    description:
      "Estimate take-home tax in India: new vs old regime basics, what calculators can and cannot do, and how to verify on the Income Tax portal before filing.",
    keywords: [
      "salary tax calculator india",
      "new tax regime vs old",
      "income tax slabs india",
      "take home salary calculator",
      "form 16 tax estimate",
    ],
    readingMinutes: 11,
    updatedLabel: "Aug 2026",
    relatedHref: "/tools/salary-tax-calculator",
    relatedLabel: "Open salary tax calculator",
    clusterId: "salary-tax",
    faqs: [
      {
        q: "Which is better — new or old regime?",
        a: "It depends on your deductions. The new regime uses revised slabs with fewer deductions; the old regime can win if you have large eligible deductions. Run both numbers, then confirm with Form 16 / a CA.",
      },
      {
        q: "Is this the Income Tax Department portal?",
        a: "No. ContentVerse India’s calculator is an independent educational estimate. File and verify on the official Income Tax portal.",
      },
    ],
    blocks: [
      {
        heading: "Why salary tax estimates matter",
        paragraphs: [
          "Choosing a tax regime without numbers is guessing. A calculator helps you compare take-home under simplified assumptions — standard deduction, slabs, and common inputs — before you lock a choice at filing time.",
          "Rules, rebates, and surcharge thresholds change. Treat every output as a planning aid, then verify on the official e-filing utilities or with a qualified CA.",
        ],
      },
      {
        heading: "New vs old regime — quick context",
        paragraphs: [
          "The new default regime uses revised slabs with fewer deductions. The old regime can still win with HRA, 80C, and other eligible claims. Enter the same CTC twice in our tool: once with new-regime defaults, once with old-regime deductions you actually claim.",
        ],
      },
      {
        heading: "What to verify before you file",
        paragraphs: [
          "Match Form 16, employer TDS, and investment proofs. Section 87A rebates and surcharge rules can change year to year. Do not rely on a blog calculator alone for final liability.",
        ],
        bullets: [
          "Keep Form 16 and AIS/TIS handy",
          "Confirm regime choice deadlines with official guidance",
          "Use the Income Tax portal for filing",
        ],
      },
    ],
  },
  {
    slug: "gst-calculator-india-freelancers-guide",
    section: "money",
    title: "GST Calculator India — Invoice GST for Freelancers & Small Business",
    shortTitle: "GST guide",
    description:
      "Split GST on invoices in India: exclusive vs inclusive GST, common rates (5/12/18/28), freelancer basics, and how to use our free GST calculator.",
    keywords: [
      "gst calculator india",
      "gst inclusive exclusive",
      "freelancer gst",
      "invoice gst 18%",
      "gst rates india",
    ],
    readingMinutes: 10,
    updatedLabel: "Aug 2026",
    relatedHref: "/tools/gst-calculator",
    relatedLabel: "Open GST calculator",
    clusterId: "gst-business",
    faqs: [
      {
        q: "What is exclusive vs inclusive GST?",
        a: "Exclusive: tax is added on top of the base. Inclusive: the total already contains GST and you reverse-calculate the base. Know which mode your invoice uses.",
      },
      {
        q: "Does this tool file GST returns?",
        a: "No. Use the official GST portal for registration, GSTR filing, and official computations. Our calculator is for quotes and invoice checks only.",
      },
    ],
    blocks: [
      {
        heading: "GST on everyday invoices",
        paragraphs: [
          "Freelancers and small businesses constantly split GST at common rates (5%, 12%, 18%, 28%). Mistakes show up as awkward client conversations and messy books. A calculator helps you quote cleanly — registration and filing still happen only on the GST portal.",
        ],
      },
      {
        heading: "Exclusive vs inclusive — worked intuition",
        paragraphs: [
          "Exclusive example: base ₹10,000 at 18% adds ₹1,800 → total ₹11,800. Inclusive mode starts from the total and recovers base + tax. Always state which mode you used on the quote.",
        ],
      },
      {
        heading: "Freelancer checklist (educational)",
        paragraphs: [
          "Know whether you must register based on turnover thresholds (confirm current law officially). Keep GSTIN on invoices when registered. Separate tax collected from money you can spend. This is not tax advice — thresholds and composition scheme rules change.",
        ],
      },
    ],
  },
];
