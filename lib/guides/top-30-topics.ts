/**
 * Top-30 high-intent India topics — full SEO guides (not thin stubs).
 * Each page: keyword title, 150–160 char meta, H2s, FAQ, internal links.
 */
import type { GuideArticle, GuideBlock, GuideFaq, GuideSectionSlug } from "./registry";

function block(
  heading: string,
  paragraphs: string[],
  bullets?: string[]
): GuideBlock {
  return bullets?.length ? { heading, paragraphs, bullets } : { heading, paragraphs };
}

function faq(q: string, a: string): GuideFaq {
  return { q, a };
}

function topic(input: {
  slug: string;
  section: GuideSectionSlug;
  title: string;
  shortTitle: string;
  description: string;
  keywords: string[];
  readingMinutes: number;
  clusterId: string;
  relatedHref: string;
  relatedLabel: string;
  blocks: GuideBlock[];
  faqs: GuideFaq[];
}): GuideArticle {
  return {
    ...input,
    updatedLabel: "Aug 2026",
  };
}

/** Remaining ranking topics (pillars 7–30). First 6 live in pillar-articles.ts. */
export const TOP_30_TOPIC_ARTICLES: GuideArticle[] = [
  topic({
    slug: "fd-vs-rd-india-guide",
    section: "money",
    title: "FD vs RD in India — Which Savings Plan Fits Your Goal? (2026)",
    shortTitle: "FD vs RD",
    description:
      "FD vs RD in India compared: liquidity, compounding, tenure, premature withdrawal, and tax on interest — plus calculators to run both numbers before you lock money.",
    keywords: [
      "fd vs rd india",
      "fixed deposit vs recurring deposit",
      "fd calculator india",
      "rd calculator",
      "which is better fd or rd",
      "interest on fd tax",
    ],
    readingMinutes: 11,
    clusterId: "sip-investing",
    relatedHref: "/tools/fd-calculator",
    relatedLabel: "Open FD calculator",
    blocks: [
      block("FD and RD in one sentence", [
        "A Fixed Deposit (FD) is a lump sum parked for a chosen tenure at a published rate. A Recurring Deposit (RD) is a monthly contribution that compounds over the same style of bank tenure. They are savings products, not market-linked funds — still subject to bank credit risk and premature-penalty rules.",
        "Use ContentVerse India’s FD and RD calculators to compare maturity value, then confirm the live rate, compounding convention, and TDS rules on your bank’s official page. This guide is educational, not a product recommendation.",
      ]),
      block("When an FD usually fits", [
        "FDs suit money you already have and will not need until a known date — a wedding buffer, a down-payment parked for 12–24 months, or a senior-citizen rate you want to lock. Laddering (splitting across 3–4 tenures) reduces the pain of breaking one large FD.",
      ], [
        "Compare quarterly vs annual compounding before you pick a bank",
        "Ask about auto-renewal so money is not locked by surprise",
        "Senior-citizen rates and tax-saver FDs follow different rules — read the product sheet",
      ]),
      block("When an RD usually fits", [
        "RDs suit a monthly surplus you can commit — similar discipline to a SIP, but with a bank-style rate instead of market returns. Missing instalments can cut the effective yield; check your bank’s penalty table.",
      ]),
      block("Tax and premature withdrawal", [
        "Interest on FDs and RDs is generally taxable as per your slab (confirm current law). Banks may deduct TDS above notified thresholds. Breaking early often costs a rate cut — run the calculator twice: hold-to-maturity vs break-after-N-months — before you book.",
      ]),
    ],
    faqs: [
      faq("Is FD safer than RD?", "Credit risk is similar if both are with the same bank. The difference is cashflow: FD needs a lump sum; RD needs monthly discipline. Deposit insurance limits apply at entity level — read DICGC coverage on official pages."),
      faq("Can I convert RD to FD?", "Some banks allow premature closure of RD into an FD or payout; terms vary. Ask the issuer, do not assume."),
      faq("FD vs SIP — which is better?", "They solve different jobs. FD/RD aim for more predictable rupee outcomes; SIPs in market funds aim for long-horizon growth with volatility. Many households use both. Not personalised advice."),
      faq("Does your calculator open an FD?", "No. It estimates maturity. Booking happens only on your bank’s official channel."),
    ],
  }),
  topic({
    slug: "ppf-account-india-guide",
    section: "money",
    title: "PPF Account India 2026 — Limit, Lock-in, Interest & Tax Benefits",
    shortTitle: "PPF guide",
    description:
      "PPF in India explained: annual contribution cap, 15-year lock-in, interest resets, partial withdrawal, and how to use our PPF calculator for planning — not account opening.",
    keywords: [
      "ppf account india",
      "ppf limit 2026",
      "ppf lock in period",
      "ppf calculator",
      "ppf tax benefit",
      "ppf partial withdrawal",
    ],
    readingMinutes: 12,
    clusterId: "sip-investing",
    relatedHref: "/tools/ppf-calculator",
    relatedLabel: "Open PPF calculator",
    blocks: [
      block("What PPF is for", [
        "The Public Provident Fund is a long-horizon government-backed savings scheme with contribution caps and a multi-year lock-in. Indians use it for retirement buffers and (under the old tax regime) eligible 80C-style claims — confirm current tax treatment on official Income Tax / Post Office pages.",
        "Our PPF calculator projects contributions and assumed interest. Notified rates change. This page does not open a PPF account.",
      ]),
      block("Contribution cap and tenure", [
        "There is an annual contribution ceiling (commonly discussed as ₹1.5 lakh — verify the live notified cap). The classic tenure is 15 years from the end of the year of opening, with extension options. Missing years can affect compounding — read Post Office / bank PPF rules before you skip a year.",
      ]),
      block("Withdrawals and loans against PPF", [
        "Partial withdrawals and loans against PPF follow year-based eligibility. Treat early liquidity as limited. If you need money in 2–3 years, PPF is usually the wrong bucket versus an FD or liquid fund (not advice — match the product to the goal).",
      ]),
      block("How to use the calculator", [
        "Enter yearly contribution and years. Compare a full 15-year path versus a shorter mental model so you see how lock-in and compounding interact. Then confirm today’s notified interest on official sources.",
      ]),
    ],
    faqs: [
      faq("Is PPF interest tax-free?", "PPF has historically been EEE in many years — confirm the current year on the Income Tax Department / official scheme page. Do not file based on a blog."),
      faq("Can I have two PPF accounts?", "Rules generally restrict multiple accounts for the same individual. Excess accounts can create compliance issues — check official FAQs."),
      faq("PPF vs SIP ELSS?", "PPF is a savings scheme with notified rates and lock-in. ELSS is a market-linked 80C option with equity risk and a 3-year lock-in. Different risk. Not a recommendation."),
      faq("Where do I open PPF?", "Post Office or authorised banks. ContentVerse India only explains and calculates."),
    ],
  }),
  topic({
    slug: "credit-score-cibil-india-guide",
    section: "money",
    title: "Credit Score in India — What Actually Moves CIBIL (No Myths)",
    shortTitle: "Credit score",
    description:
      "Credit score India explainer: utilisation, on-time EMIs, hard inquiries, and what does not magically raise CIBIL — educational only, not a score-repair service.",
    keywords: [
      "credit score india",
      "improve cibil score",
      "what affects cibil",
      "credit utilisation india",
      "hard inquiry credit score",
      "cibil vs experian",
    ],
    readingMinutes: 11,
    clusterId: "emi-loans",
    relatedHref: "/tools/emi-calculator",
    relatedLabel: "Plan EMIs first",
    blocks: [
      block("What a credit score is used for", [
        "Lenders in India pull bureau reports (CIBIL and others) when you apply for cards, personal loans, or home loans. A higher score can mean easier approval or better pricing — it is not a moral grade and it is not guaranteed by any app.",
        "ContentVerse India does not sell “score boost” packages. Freezing, disputes, and official reports live with bureaus and your banks.",
      ]),
      block("Factors that actually move scores", [
        "On-time EMIs and card payments matter. High revolving utilisation (using most of your card limit) often hurts. Many hard inquiries in a short window can look like stress. A thin file (too few accounts) can also cap the score.",
      ], [
        "Pay at least full statement dues on cards when you can — minimum due is a trap (see our minimum-due guide)",
        "Keep old healthy accounts open unless there is a fee reason to close",
        "One genuine application is fine; shopping five lenders in a week is noisier",
      ]),
      block("Myths to ignore", [
        "Checking your own score through official/free channels is usually a soft pull. Paying someone on Telegram to “fix CIBIL in 7 days” is a scam pattern. Closing every card does not auto-reset history.",
      ]),
      block("Before you take a new EMI", [
        "Run the EMI through our calculator so the new obligation fits take-home pay. A score is not a substitute for cashflow. If a lender rejects you, read the reason code on the bureau report instead of applying everywhere the same day.",
      ]),
      block("A practical 30-day repair plan", [
        "Week 1: pull your report from a legitimate bureau source. List every account, recent enquiries, and overdue amounts. Dispute clear errors (closed loans still open, wrong personal details) with documents.",
        "Week 2: stop new late marks — pay EMI and card bills on time, even if you can only clear the statement in parts after the due date is protected. Autopay helps when the salary account is reliable.",
        "Week 3: cut revolving utilisation. Pay down cards near the limit; avoid opening several new accounts in one week. Do not close your oldest healthy card just to “reset” history.",
        "Week 4: make a monthly money date. Bureaux update on cycles, not overnight. Be sceptical of anyone who guarantees a 100-point jump.",
      ], [
        "Target keeping card utilisation comfortably under ~30% where you can",
        "Soft self-checks usually do not hurt the way lender hard enquiries can",
        "ContentVerse India does not sell score-repair packages",
      ]),
    ],
    faqs: [
      faq("How long does a late payment stay?", "Typically years on the report — confirm bureau FAQs. The practical fix is a long stretch of on-time payments, not a paid “deletion” service."),
      faq("Does checking my score reduce it?", "Self-checks via official consumer portals are generally soft. Lender applications are often hard. Read the bureau’s own FAQ."),
      faq("CIBIL vs Experian vs CRIF?", "Different bureaus, similar idea. Lenders may use one or more. Numbers will not match perfectly."),
      faq("Is this credit repair?", "No. Educational content only."),
    ],
  }),
  topic({
    slug: "upi-fraud-otp-scam-india",
    section: "schemes",
    title: "UPI Fraud in India — OTP Scams, Freeze Steps & How to Report",
    shortTitle: "UPI fraud",
    description:
      "UPI fraud India: fake collect requests, OTP fishing, remote-access scams, how to call your bank, and report on cybercrime.gov.in / 1930 — never share OTP.",
    keywords: [
      "upi fraud india",
      "upi otp scam",
      "report upi fraud",
      "1930 cybercrime",
      "gpay phonepe fraud",
      "upi collect request scam",
    ],
    readingMinutes: 10,
    clusterId: "govt-schemes",
    relatedHref: "/guides/schemes/how-to-verify-govt-scheme-before-you-apply",
    relatedLabel: "Verify schemes safely",
    blocks: [
      block("How UPI scams usually look", [
        "Scammers impersonate banks, delivery staff, or “IT cell / cyber police”. They ask you to approve a collect request, share an OTP, install a remote-access app, or scan a QR that actually pays them. Real banks and police do not ask you to transfer money to “verify” or “unfreeze” an account.",
      ]),
      block("First 30 minutes if money left", [
        "Call your bank / UPI app helpline and request a freeze or dispute with the UTR. Note time, amount, UPI ID, and screenshots. File on the National Cybercrime portal and use the 1930 helpline where applicable. Delay reduces recovery odds.",
      ], [
        "Do not argue in-chat — cut the call and use official numbers from the app",
        "Do not install AnyDesk / TeamViewer because a stranger asked",
        "Do not “test” by sending a small amount to the same UPI ID",
      ]),
      block("Prevention that actually works", [
        "Turn on transaction alerts. Use UPI PIN only on your own phone. Decline unexpected collect requests. For merchants, confirm the name on the pay screen matches the shop.",
      ]),
      block("What ContentVerse India will never do", [
        "We will never call you to collect FASTag, tax, or KYC fees. Scheme explainers here are educational. Pay government dues only on official portals.",
      ]),
    ],
    faqs: [
      faq("Will I get the money back?", "Not guaranteed. Speed and bank/NPCI processes decide. Report immediately."),
      faq("Is 1930 real?", "It is the commonly cited national cybercrime helpline — confirm on official government pages if numbers change."),
      faq("Fake FASTag recharge via UPI?", "Pay only inside your issuer bank app. Random QR posters and WhatsApp agents are high-risk."),
      faq("Should I share screenshot of UPI PIN?", "Never. PIN, OTP, and CVV are never for “support”."),
    ],
  }),
  topic({
    slug: "huid-hallmark-gold-buying-india",
    section: "money",
    title: "Buying Gold in India — HUID, Hallmark & Invoice Checklist",
    shortTitle: "HUID gold",
    description:
      "HUID and BIS hallmark checklist before you pay for gold in India: 22K vs 24K, invoice lines, making charges, and how to verify HUID — not a jewellery shop.",
    keywords: [
      "huid verification",
      "bis hallmark gold",
      "huid gold india",
      "22k vs 24k gold",
      "gold making charges",
      "hallmark jewellery checklist",
    ],
    readingMinutes: 11,
    clusterId: "banking-ifsc",
    relatedHref: "/huid-verification",
    relatedLabel: "HUID verification tool",
    blocks: [
      block("Why HUID exists", [
        "Hallmark Unique Identification (HUID) helps trace hallmarked jewellery. Before paying, check that the piece is hallmarked and that the invoice lists purity, weight, making charges, and GST clearly. ContentVerse India’s HUID tool is a convenience checker — BIS / official portals remain the source of truth.",
      ]),
      block("22K vs 24K vs making charges", [
        "24K is finer purity; most jewellery in India is 22K with making charges on top. Two shops can quote the same “gold rate” and still differ a lot on making, wastage, and buyback. Ask for net payable in writing.",
      ]),
      block("Invoice red flags", [
        "Cash-only deals with no GST invoice, “we’ll hallmark later”, or pressure to skip weighing in front of you. For investment-like buying, compare making charges and buyback policy — this is not investment advice.",
      ]),
      block("How to verify HUID on ContentVerse India", [
        "Open the free HUID checker, enter the 6-character code from the piece (or invoice), and match purity / jeweller details against what you were told at the counter. Treat mismatches as a stop-the-purchase signal and confirm on BIS / official channels. Never share OTP or remote-access apps with a “hallmark agent”.",
      ]),
      block("After you buy", [
        "Keep the invoice. Photograph HUID marks. If you ever pledge gold for a loan, lenders will weigh and test — undocumented pieces are harder to use.",
      ]),
    ],
    faqs: [
      faq("Is HUID mandatory?", "Hallmarking rules have expanded — confirm current BIS / government notifications for your jewellery type and city."),
      faq("Does HUID prove I own it?", "It identifies a hallmarked article; ownership still needs your invoice and KYC at the jeweller."),
      faq("Gold ETF vs jewellery?", "Jewellery includes making charges and design risk. ETFs/SGBs are different products. Not a recommendation."),
      faq("Can ContentVerse buy gold for me?", "No."),
    ],
  }),
  topic({
    slug: "highway-fuel-fastag-trip-planner",
    section: "money",
    title: "Highway Trip Fuel Cost India — FASTag, Litres & Price Buffer",
    shortTitle: "Highway fuel",
    description:
      "Plan highway fuel cost in India: estimate litres from mileage, add a 10–15% buffer, keep FASTag funded, and check city fuel prices before you leave.",
    keywords: [
      "highway fuel cost india",
      "trip fuel calculator",
      "petrol price highway",
      "fastag balance trip",
      "delhi mumbai fuel cost",
    ],
    readingMinutes: 9,
    clusterId: "travel-fuel",
    relatedHref: "/tools/fuel-price",
    relatedLabel: "Check fuel prices",
    blocks: [
      block("Simple trip math", [
        "Estimate distance, divide by your car’s realistic km/l (not brochure), multiply by today’s city petrol/diesel reading, then add 10–15% for traffic, AC, and highway vs city pump differences.",
        "Pair this with a funded FASTag so you are not troubleshooting KYC at a plaza. See our FASTag pillar for recharge and blacklist basics.",
      ]),
      block("Pump and timing tips", [
        "City and highway pumps can differ the same day because of local taxes and dealer costs. Do not assume the cheapest Instagram screenshot. Confirm the board at the pump.",
      ]),
      block("EV and CNG note", [
        "If you are not on petrol/diesel, compare rupees per kilometre including charging/CNG detours. Our fuel page is for liquid fuel context, not an OMCs live feed.",
      ]),
    ],
    faqs: [
      faq("Can I trust an app price 100%?", "Treat it as planning. The illuminated board at the pump is what you pay."),
      faq("Should I fill at every small town?", "Carry a buffer; remote stretches can have fewer pumps or different rates."),
      faq("FASTag plus fuel budget?", "Yes — two separate wallets. Low FASTag balance is a different failure than empty tank."),
    ],
  }),
  topic({
    slug: "used-car-rc-rto-vahan-india",
    section: "money",
    title: "Used Car RC Check India — RTO Codes vs Official Vahan Steps",
    shortTitle: "Used car RC",
    description:
      "Used car due diligence in India: what public RTO codes tell you, what only Vahan/Parivahan can confirm, hypothecation, and why owner-lookup sites are unsafe.",
    keywords: [
      "used car rc verification",
      "vahan rc check",
      "rto code india",
      "hypothecation used car",
      "parivahan vehicle details",
    ],
    readingMinutes: 10,
    clusterId: "travel-fuel",
    relatedHref: "/tools/rto-finder",
    relatedLabel: "RTO code finder",
    blocks: [
      block("What an RTO code is (and is not)", [
        "Registration marks encode a registering authority. Our RTO finder helps you read public patterns. It does not reveal owner name, phone, or private challan history — those need authenticated official services.",
      ]),
      block("Official checks before you pay", [
        "Use Parivahan / Vahan flows the seller can complete with OTP. Confirm hypothecation (loan) is closed, insurance is valid, and chassis/engine numbers match the RC. A physical inspection still matters.",
      ]),
      block("Unsafe “owner details” websites", [
        "Scraped databases that sell phone numbers are often illegal or stale. Prefer official portals. Report suspicious sites.",
      ]),
    ],
    faqs: [
      faq("Is RTO code enough to buy?", "No. It is geography/context only."),
      faq("What is hypothecation?", "A financier’s claim on the vehicle until the loan is closed. Buying without checking can block transfer."),
      faq("Does ContentVerse pull private RC data?", "No."),
    ],
  }),
  topic({
    slug: "digital-arrest-scam-india",
    section: "schemes",
    title: "Digital Arrest Scams in India — Red Flags, 1930 & What Not to Do",
    shortTitle: "Digital arrest",
    description:
      "Digital arrest scam India: fake video-call “police”, courier drugs stories, and demands to transfer money. Hang up, call 1930 / cybercrime.gov.in, never pay.",
    keywords: [
      "digital arrest scam",
      "fake police video call india",
      "cybercrime 1930",
      "customs parcel scam india",
      "do not pay digital arrest",
    ],
    readingMinutes: 9,
    clusterId: "govt-schemes",
    relatedHref: "/guides/money/upi-fraud-otp-scam-india",
    relatedLabel: "UPI fraud steps",
    blocks: [
      block("The script you will hear", [
        "A video call shows people in uniform. They claim a parcel has drugs / a warrant is out / your Aadhaar is linked to a crime. They demand secrecy, a “safe account”, and immediate UPI or crypto. Real police do not run courts on WhatsApp.",
      ]),
      block("What to do", [
        "Hang up. Tell family. Call official police helplines or 1930 and file on cybercrime.gov.in. Do not continue the call “to see if they are real”. Do not download remote-access apps.",
      ]),
      block("If you already paid", [
        "Bank freeze + cyber complaint with UTRs the same day. Shame is the scam’s weapon — reporting is the counter.",
      ]),
    ],
    faqs: [
      faq("Would police video-call me?", "Not like this. Verify via official numbers you looked up yourself."),
      faq("They have my photo from Aadhaar leak?", "Still not a reason to pay. File a complaint."),
      faq("Is ContentVerse affiliated with police?", "No. Educational safety guide only."),
    ],
  }),
  topic({
    slug: "aadhaar-update-online-india",
    section: "schemes",
    title: "Aadhaar Update Online India — Address vs Mobile, Common Errors",
    shortTitle: "Aadhaar update",
    description:
      "Aadhaar address and mobile update in India: myAadhaar portal vs appointment, document mismatch errors, and why OTP scams posing as UIDAI are common.",
    keywords: [
      "aadhaar update online",
      "aadhaar address change",
      "aadhaar mobile update",
      "uidai myaadhaar",
      "aadhaar otp scam",
    ],
    readingMinutes: 10,
    clusterId: "govt-schemes",
    relatedHref: "/guides/schemes/how-to-verify-govt-scheme-before-you-apply",
    relatedLabel: "Official portal checklist",
    blocks: [
      block("Use only UIDAI properties", [
        "Address and mobile updates go through myAadhaar / UIDAI official domains. WhatsApp “operators” who ask for OTP to “speed up Aadhaar” are a classic fraud. ContentVerse India does not process Aadhaar.",
      ]),
      block("Address vs mobile — different flows", [
        "Mobile update is often OTP-based if the number is in your control. Address updates usually need supporting documents and may involve appointment or online document upload depending on current UIDAI rules. Names must match supporting IDs closely.",
      ]),
      block("Common rejection reasons", [
        "Blurred scans, expired proofs, mismatch between form and document, or using a third-party café that keeps your OTP. Prefer doing it yourself on a trusted device.",
      ]),
    ],
    faqs: [
      faq("Is there a fee?", "Some updates have notified fees; some categories may have waivers. Confirm on UIDAI."),
      faq("Can I update from abroad?", "Check current UIDAI guidance for OCI/NRI processes — they change."),
      faq("Will ContentVerse store Aadhaar?", "No. Never paste Aadhaar numbers into random chat tools."),
    ],
  }),
  topic({
    slug: "ayushman-bharat-pmjay-eligibility",
    section: "schemes",
    title: "Ayushman Bharat (PM-JAY) Eligibility — Who Is Covered & How to Check",
    shortTitle: "PM-JAY eligibility",
    description:
      "Ayushman Bharat PM-JAY eligibility in plain English: SECC-based lists, beneficiary check on official sites, empanelled hospitals — ContentVerse does not enrol you.",
    keywords: [
      "ayushman bharat eligibility",
      "pm jay who is eligible",
      "ayushman card check",
      "pmjay hospital list",
      "secc ayushman",
    ],
    readingMinutes: 10,
    clusterId: "govt-schemes",
    relatedHref: "/guides/schemes",
    relatedLabel: "More scheme guides",
    blocks: [
      block("What PM-JAY is", [
        "PM-JAY is a health assurance scheme for eligible families, with hospitalisation cover as notified. Eligibility is not “anyone who applies on Instagram”. Lists are tied to SECC and state processes that can change.",
      ]),
      block("How to check (official only)", [
        "Use the official PM-JAY / NHA beneficiary search and state health portals. Empanelled hospital lists also live there. Anyone asking for a fee to “make an Ayushman card” is a red flag.",
      ]),
      block("At the hospital", [
        "Carry ID as instructed on the official site. Pre-authorisation is between hospital and scheme — we cannot speed it up. This is not medical advice.",
      ]),
    ],
    faqs: [
      faq("Can I buy Ayushman like insurance?", "PM-JAY is not a retail policy you purchase like a private plan. Eligibility is list-based. Confirm official FAQs."),
      faq("Does it cover all OPDs?", "Cover is defined in scheme packages — read official inclusions/exclusions."),
      faq("Is this the NHA website?", "No. Independent explainer."),
    ],
  }),
  topic({
    slug: "hra-exemption-documents-india",
    section: "money",
    title: "HRA Exemption India — Rent Receipts, Metro Rules & Form 16",
    shortTitle: "HRA exemption",
    description:
      "HRA exemption in India: metro vs non-metro, rent receipts and PAN of landlord, and why HRA usually applies under the old regime — verify with Form 16 / CA.",
    keywords: [
      "hra exemption india",
      "hra documents",
      "rent receipt hra",
      "metro hra 50 percent",
      "hra old tax regime",
    ],
    readingMinutes: 10,
    clusterId: "salary-tax",
    relatedHref: "/tools/salary-tax-calculator",
    relatedLabel: "Compare tax regimes",
    blocks: [
      block("HRA is a calculation, not a refund button", [
        "House Rent Allowance exemption is the minimum of a few statutory tests (salary, rent paid minus 10% of salary, and metro/non-metro percentages). Employers report it on Form 16. Our salary-tax calculator is a planning aid — not the Income Tax portal.",
      ]),
      block("Documents CAs actually ask for", [
        "Rent receipts, rental agreement, landlord PAN if rent is above notified thresholds, and cancelled cheque/UTR if asked. Paying cash without receipts is a common notice trigger.",
      ]),
      block("New vs old regime", [
        "HRA exemption is an old-regime style claim in typical years. If you are on the new regime, HRA exemption may not apply — confirm the current Finance Act / CBDT guidance before you choose a regime.",
      ]),
    ],
    faqs: [
      faq("Can I claim HRA living with parents?", "Sometimes, if there is a genuine rental and they declare income — this is fact-specific. Ask a CA."),
      faq("Metro list?", "Notified metros for the 50% rule are defined in tax law — do not guess from a tweet."),
      faq("Will ContentVerse file ITR?", "No."),
    ],
  }),
  topic({
    slug: "section-80c-elss-ppf-lic-india",
    section: "money",
    title: "Section 80C India — ELSS vs PPF vs LIC (Simple Comparison)",
    shortTitle: "Section 80C",
    description:
      "Section 80C options in India compared simply: ₹1.5 lakh cap, lock-ins for ELSS, PPF and LIC, and why this is not a product recommendation — old-regime context.",
    keywords: [
      "section 80c options",
      "elss vs ppf",
      "80c limit",
      "lic 80c",
      "best 80c investment india",
    ],
    readingMinutes: 10,
    clusterId: "salary-tax",
    relatedHref: "/guides/money/ppf-account-india-guide",
    relatedLabel: "PPF explainer",
    blocks: [
      block("The cap comes first", [
        "Section 80C (when available in the regime you choose) has a combined limit commonly cited as ₹1.5 lakh. Mixing ELSS, PPF, life insurance premiums, and EPF still shares that cap. Confirm current law.",
      ]),
      block("Lock-in is the real difference", [
        "ELSS typically has a 3-year lock-in and equity market risk. PPF has a long lock-in and notified rates. Traditional LIC premiums may qualify but the product is insurance + savings — read the benefit illustration, not just “80C”.",
      ]),
      block("Do not buy for the deduction alone", [
        "A deduction is not free money if the product is a poor fit. Use our tax calculator to see whether old regime even wins for you this year.",
      ]),
      block("Salaried 80C checklist (do this before March)", [
        "Count what is already happening: EPF on the payslip, eligible home-loan principal, children’s tuition fees. Many employees are closer to the ₹1.5 lakh cap than they think. Fill remaining room only with products you would buy without the tax label — PPF for long safety, ELSS for long equity risk. Keep proofs for the employer declaration and for ITR. Limits change with budgets — verify the current FY on the Income Tax portal.",
      ], [
        "Do not double-count the same investment",
        "Review insurance need separately from “80C selling”",
        "Use the salary-tax calculator for estimates, then confirm with Form 16",
      ]),
    ],
    faqs: [
      faq("Is 80C in the new regime?", "The new regime historically disallows many deductions. Confirm the year you are filing for."),
      faq("ELSS is guaranteed?", "No. Market-linked."),
      faq("Which 80C is best?", "No single answer. Not advice."),
    ],
  }),
  topic({
    slug: "gold-loan-vs-personal-loan-india",
    section: "money",
    title: "Gold Loan vs Personal Loan India — LTV, Rates & When Each Fits",
    shortTitle: "Gold vs personal loan",
    description:
      "Gold loan vs personal loan in India: LTV, interest, processing fees, and repossession risk — run EMIs on our calculator. Educational, not a lender offer.",
    keywords: [
      "gold loan vs personal loan",
      "gold loan ltv india",
      "personal loan emi",
      "gold loan interest",
      "should i take gold loan",
    ],
    readingMinutes: 10,
    clusterId: "emi-loans",
    relatedHref: "/tools/emi-calculator",
    relatedLabel: "Compare EMIs",
    blocks: [
      block("Collateral vs clean loan", [
        "A gold loan is secured against jewellery; LTV (loan-to-value) caps how much you get versus gold value. A personal loan is typically unsecured and priced for your income and bureau score. Neither is “free money”.",
      ]),
      block("Cost stack to compare", [
        "Interest, processing fee, valuation charges, penal interest, and foreclosure rules. Gold loans can look cheaper until auction/repossession clauses after missed payments. Personal loans can be costlier but do not put family jewellery at risk.",
      ]),
      block("Use the EMI calculator twice", [
        "Same tenure, two principals/rates. Then read the lender’s KFS / MITC. This is not a loan marketplace.",
      ]),
    ],
    faqs: [
      faq("Will they sell my gold immediately?", "After notice periods in the agreement. Read the contract."),
      faq("Can I part-release gold?", "Product-specific."),
      faq("Is this an offer?", "No."),
    ],
  }),
  topic({
    slug: "credit-card-minimum-due-india",
    section: "money",
    title: "Credit Card Minimum Due in India — Why It Costs So Much",
    shortTitle: "Minimum due trap",
    description:
      "Credit card minimum due in India explained: revolving interest, GST on fees, and why converting to EMI is still debt. Pay full statement when you can.",
    keywords: [
      "credit card minimum due",
      "credit card interest india",
      "revolving credit trap",
      "card emi conversion",
      "gst on credit card interest",
    ],
    readingMinutes: 9,
    clusterId: "emi-loans",
    relatedHref: "/guides/money/credit-score-cibil-india-guide",
    relatedLabel: "Credit score basics",
    blocks: [
      block("Minimum due is not “you’re fine”", [
        "Paying only the minimum keeps the account current but the rest revolving at high annualised rates plus fees. The statement looks small; the true cost is not.",
      ]),
      block("Rough cost intuition", [
        "If you revolve ₹50,000, a mid-30s to 40%+ effective cost (rate + GST on finance charges, depending on issuer) can wipe months of salary discipline. Read your issuer’s MITC; our numbers are educational illustrations.",
      ]),
      block("EMI conversion is still a loan", [
        "Converting to EMI can lower the monthly hit and still cost interest. Compare with a personal loan EMI on our calculator if you are restructuring — not advice.",
      ]),
    ],
    faqs: [
      faq("Does minimum due protect CIBIL?", "It avoids a full delinquency if paid on time, but high utilisation still hurts. Pay more than minimum when possible."),
      faq("Grace period?", "Usually only if previous bill was cleared in full. Revolvers often lose interest-free period."),
      faq("Should I close the card?", "Depends on fees and utilisation. Not advice."),
    ],
  }),
  topic({
    slug: "50-30-20-budget-indian-salary",
    section: "money",
    title: "50-30-20 Budget on Indian Salaries — Metro Rent & EMI Reality",
    shortTitle: "50-30-20 India",
    description:
      "50-30-20 budget for Indian salaries: how to split needs, wants, and savings when metro rent and EMIs already eat 50%. Use MoneyVerse to track UPI spends.",
    keywords: [
      "50 30 20 rule india",
      "budget indian salary",
      "how to budget after emi",
      "metro rent budget",
      "upi expense tracker",
    ],
    readingMinutes: 9,
    clusterId: "emi-loans",
    relatedHref: "/moneyverse",
    relatedLabel: "Track expenses",
    blocks: [
      block("The rule, then the India edit", [
        "Classic 50-30-20 is needs / wants / savings. In Indian metros, rent + commute + EMIs can blow past 50% before you start. Treat the rule as a compass, not a moral failure if your 50% is already rent.",
      ]),
      block("A practical three-bucket template", [
        "Needs: rent, groceries, commute, minimum EMIs, insurance. Wants: eating out, OTT, shopping. Savings: SIP/PPF/emergency. If needs exceed 50%, cut wants first, then attack high-interest revolving credit before increasing SIPs.",
      ]),
      block("Make UPI visible", [
        "PhonePe/GPay spends vanish. Screenshot-scan or statement tools in MoneyVerse help you see the week. Review every Sunday for 10 minutes — that habit beats a perfect spreadsheet you never open.",
      ]),
    ],
    faqs: [
      faq("Is 50-30-20 scientific?", "It is a heuristic popularised in personal-finance writing, not a law."),
      faq("Should SIP wait until debt is gone?", "High-interest card debt usually comes first. Home-loan EMIs are different. Not advice."),
      faq("Does MoneyVerse replace a CA?", "No."),
    ],
  }),
  topic({
    slug: "nifty-sensex-beginners-india",
    section: "money",
    title: "Nifty & Sensex for Beginners — Index vs Mutual Funds (India)",
    shortTitle: "Nifty Sensex",
    description:
      "Nifty and Sensex explained for beginners in India: what an index is, index funds vs active funds, and why live tickers are not trading signals.",
    keywords: [
      "nifty sensex explained",
      "what is nifty 50",
      "index fund vs active fund",
      "sensex for beginners",
      "nifty live meaning",
    ],
    readingMinutes: 10,
    clusterId: "sip-investing",
    relatedHref: "/finance",
    relatedLabel: "Finance hub",
    blocks: [
      block("An index is a scoreboard, not a stock you buy directly", [
        "Nifty 50 and Sensex are baskets of large companies with rules for inclusion. You cannot “buy the Sensex” as one share on the exchange the way you buy Reliance — you use index funds, ETFs, or futures (advanced).",
      ]),
      block("Index funds vs active funds", [
        "Index funds aim to match the basket cheaply. Active funds aim to beat it after fees — many do not, over long periods, but past data is not a promise. SIPs into either still carry market risk.",
      ]),
      block("How to read our live strip", [
        "Green/red numbers are delayed or vendor-fed snapshots for context. They are not a buy/sell call. SEBI-registered advice is a different product.",
      ]),
    ],
    faqs: [
      faq("Is Nifty guaranteed to go up?", "No."),
      faq("SIP into Nifty index fund?", "A common long-horizon approach for some investors — still volatile. Not a recommendation."),
      faq("Sensex vs Nifty?", "Different exchanges/baskets; they often move together but not tick-for-tick."),
    ],
  }),
  topic({
    slug: "when-to-stop-sip-mutual-fund",
    section: "money",
    title: "When to Stop a Mutual Fund SIP in India — Rebalance Without Panic",
    shortTitle: "Stop SIP?",
    description:
      "When to pause or stop a SIP in India: goal reached, emergency cash, overlapping funds, and tax on STCG/LTCG — not a panic button for every market dip.",
    keywords: [
      "when to stop sip",
      "pause sip india",
      "sip during market crash",
      "mutual fund ltcg india",
      "rebalance mutual funds",
    ],
    readingMinutes: 10,
    clusterId: "sip-investing",
    relatedHref: "/tools/sip-calculator",
    relatedLabel: "SIP calculator",
    blocks: [
      block("Stopping is a plan, not a mood", [
        "Good reasons: goal funded, job loss emergency, fund style drift, or a written allocation change. Bad reasons: one red week on TV, a relative’s tip, or FOMO into a new theme fund every quarter.",
      ]),
      block("Pause vs redeem vs switch", [
        "Pausing SIP stops new money; existing units stay invested. Redeeming realises tax. Switching may be a sale + purchase. Read scheme documents and tax rules (STCG/LTCG as currently notified).",
      ]),
      block("Use the calculator for the goal, not the headline", [
        "If the SIP was for a 10-year goal, a 1-year dip is noise unless your job cashflow broke. Our SIP calculator is for planning illustrations with assumed returns — not a forecast.",
      ]),
    ],
    faqs: [
      faq("Should I stop SIP in a crash?", "Many long-horizon investors continue; that is not advice for your situation."),
      faq("Is there an exit load?", "Often for early redemptions — check the scheme."),
      faq("SEBI disclaimer?", "Mutual fund investments are subject to market risks. Read all scheme related documents."),
    ],
  }),
  topic({
    slug: "content-creator-tax-gst-india",
    section: "money",
    title: "Income Tax for Content Creators in India — GST, TDS & Invoices",
    shortTitle: "Creator tax",
    description:
      "Creator income in India: when GST registration may apply, TDS (including 194R-style benefits), invoices, and record-keeping — educational, not a CA substitute.",
    keywords: [
      "content creator tax india",
      "youtube gst india",
      "section 194r creators",
      "influencer invoice gst",
      "tds on brand deals",
    ],
    readingMinutes: 11,
    clusterId: "gst-business",
    relatedHref: "/tools/gst-calculator",
    relatedLabel: "GST calculator",
    blocks: [
      block("You are running a small business", [
        "Brand deals, YouTube ads, and tips can all be taxable income. Keep contracts, screenshots of rates, and GST invoices if registered. ContentVerse creator payouts still need your own books.",
      ]),
      block("GST threshold (confirm live law)", [
        "Registration can become mandatory above notified turnover or for certain inter-state supplies. Composition scheme has its own limits. Use the GST portal — our calculator only splits invoice tax.",
      ]),
      block("TDS and barter", [
        "Section 194R-style rules on benefits/perquisites have bitten creators who take products “for free”. Brands may deduct TDS on fees. Collect Form 16A / AIS and reconcile before ITR.",
      ]),
    ],
    faqs: [
      faq("Hobby vs business?", "Frequent paid work looks like business. A CA should classify."),
      faq("Foreign platforms?", "FEMA/GST/IT overlay can apply. Specialist advice.",),
      faq("Does ContentVerse file for you?", "No."),
    ],
  }),
  topic({
    slug: "bank-statement-analysis-loan-india",
    section: "money",
    title: "Bank Statement Analysis for Loans in India — What Underwriters Scan",
    shortTitle: "Bank statement",
    description:
      "What lenders look for in Indian bank statements: average balance, EMI bounces, cash credits, and privacy tips before you upload a PDF to any analyser.",
    keywords: [
      "bank statement analysis loan",
      "average bank balance loan india",
      "emi bounce statement",
      "bank pdf analyser privacy",
    ],
    readingMinutes: 9,
    clusterId: "emi-loans",
    relatedHref: "/moneyverse/bank-statement-analyzer",
    relatedLabel: "Statement analyser",
    blocks: [
      block("Why lenders want 6–12 months", [
        "They look for salary credits, stable average balance, bounced EMIs/cheques, gambling or crypto patterns, and round-figure cash deposits they cannot explain. Cleaning a statement with fake credits is fraud.",
      ]),
      block("Privacy before any upload", [
        "Prefer tools that process in-browser or state they do not store PDFs. Redact unrelated account numbers if the tool allows. ContentVerse’s analyser is a convenience utility with limits — not a lender.",
      ]),
      block("What you can fix legally", [
        "Stop new bounces, keep a buffer, and document genuine cash business if that is your income type. Then use the EMI calculator so the new loan does not recreate bounces.",
      ]),
    ],
    faqs: [
      faq("Minimum average balance?", "Varies by lender and city. Ask the sales KFS, not WhatsApp forwards."),
      faq("Joint account?", "Disclose as required on the application."),
      faq("Will we share your PDF with banks?", "Use the product privacy policy on the tool page."),
    ],
  }),
  topic({
    slug: "track-upi-expenses-phonepe-gpay",
    section: "money",
    title: "Track PhonePe & GPay Spends — A Monthly UPI Budget Workflow",
    shortTitle: "UPI budget",
    description:
      "Turn UPI screenshots and app statements into a monthly budget in India: categories, weekly reviews, and MoneyVerse screenshot scan — without sharing OTPs.",
    keywords: [
      "track upi expenses",
      "phonepe budget",
      "gpay spending tracker",
      "upi screenshot scan",
      "monthly budget india",
    ],
    readingMinutes: 8,
    clusterId: "emi-loans",
    relatedHref: "/moneyverse",
    relatedLabel: "MoneyVerse",
    blocks: [
      block("UPI hides the leak", [
        "₹99 here and ₹249 there never hit like a card statement. Export monthly statements from PhonePe/GPay/BHIM or scan screenshots into MoneyVerse, then tag rent, food, EMIs, and impulse.",
      ]),
      block("A 20-minute monthly ritual", [
        "Week 1: list recurring EMIs/SIPs. Week 2–3: tag food and shopping. Month-end: one cut list (unused OTT, duplicate SIPs). Pair with the 50-30-20 guide if you need a split.",
      ]),
      block("Security", [
        "Never photograph UPI PIN. Never send statements to unknown “budget coaches” on Telegram.",
      ]),
    ],
    faqs: [
      faq("Does GPay have a native report?", "Apps add insights over time — still export if you want your own archive."),
      faq("Is OCR 100% accurate?", "No. Verify high-value lines."),
    ],
  }),
  topic({
    slug: "pm-kisan-status-ekyc-pending",
    section: "schemes",
    title: "PM-KISAN Status Check — e-KYC Pending & Payment Not Received",
    shortTitle: "PM-KISAN status",
    description:
      "PM-KISAN payment pending or e-KYC failed? Check only on the official portal, fix Aadhaar seeding, and ignore agents who charge to “release instalments”.",
    keywords: [
      "pm kisan status check",
      "pm kisan e kyc pending",
      "pm kisan payment not received",
      "pmkisan.gov.in",
      "pm kisan aadhaar seeding",
    ],
    readingMinutes: 9,
    clusterId: "govt-schemes",
    relatedHref: "/guides/schemes/pm-kisan-eligibility-how-to-apply",
    relatedLabel: "PM-KISAN eligibility guide",
    blocks: [
      block("Where to check", [
        "Beneficiary status, e-KYC, and instalment history belong on the official PM-KISAN website / app published by the ministry. ContentVerse India explains the process and does not log into your account.",
      ]),
      block("e-KYC and Aadhaar seeding", [
        "Pending e-KYC, name mismatch, or inactive bank account are common reasons instalments stop. Fix on the official flow or authorised CSC — not a WhatsApp PDF.",
      ]),
      block("Agents charging a fee", [
        "Most genuine status checks are free on the portal. Paying a private person to “approve PM-KISAN” is a fraud pattern. See our scheme-verification guide.",
      ]),
    ],
    faqs: [
      faq("Official URL?", "Use pmkisan.gov.in or the link from the agriculture ministry — type it yourself."),
      faq("How long after e-KYC?", "Varies by instalment cycle and state upload. Only the portal shows your case."),
      faq("Can I apply here?", "No."),
    ],
  }),
  topic({
    slug: "sarkari-result-vs-scorecard",
    section: "jobs",
    title: "Sarkari Result vs Scorecard — How to Read Govt Exam PDFs",
    shortTitle: "Result vs scorecard",
    description:
      "Government exam result vs scorecard in India: provisional lists, cut-offs, roll-number PDFs, and document verification — confirm only on the commission website.",
    keywords: [
      "sarkari result vs scorecard",
      "how to read ssc result pdf",
      "govt exam cutoff",
      "provisional result meaning",
      "document verification sarkari",
    ],
    readingMinutes: 9,
    clusterId: "govt-schemes",
    relatedHref: "/results",
    relatedLabel: "Sarkari results hub",
    blocks: [
      block("Result list vs scorecard", [
        "A result PDF may only list qualifying roll numbers. A scorecard/marks card shows section marks, cut-off, and sometimes rank. Do not assume “not in first PDF” means forever fail until you read the notice.",
      ]),
      block("Provisional vs final", [
        "Provisional lists can change after objections. Final appointment still needs document verification, medical, and police verification as the advertisement said.",
      ]),
      block("How to avoid fake result pages", [
        "Open the commission’s own domain from a bookmark. Our results hub links to public notices — still verify the PDF URL.",
      ]),
    ],
    faqs: [
      faq("Cutoff different by category?", "Usually yes — read the notice."),
      faq("Scorecard login not working?", "Use official forgot-password; ignore paid “unlock” sites."),
    ],
  }),
  topic({
    slug: "merge-pdf-job-application-india",
    section: "ai-tools",
    title: "Merge PDF for Job Applications in India — Size Limits & Mobile",
    shortTitle: "Merge PDF jobs",
    description:
      "Merge PDF for SSC/bank/job portals in India: page order, 2–5 MB limits, mobile compression, and why you should not email OTP to “PDF helpers”.",
    keywords: [
      "merge pdf job application",
      "compress pdf ssc",
      "pdf size limit india govt form",
      "merge pdf mobile",
    ],
    readingMinutes: 8,
    clusterId: "govt-schemes",
    relatedHref: "/tools/merge-pdf",
    relatedLabel: "Merge PDF tool",
    blocks: [
      block("Order before you merge", [
        "Application form, photo/sign if required, education proofs, caste/EWS, experience — in the notice’s order. A merged file that is 12 MB will still fail; compress after merge.",
      ]),
      block("Typical portal limits", [
        "Many Indian government forms cap 2 MB or 5 MB. Flatten scans at 150–200 DPI. Preview on phone before you sit at a cyber café.",
      ]),
      block("Privacy", [
        "Do not upload Aadhaar to random Telegram “PDF bots”. Prefer a tool you control. ContentVerse merge/compress is a utility — still avoid putting secrets in filenames.",
      ]),
    ],
    faqs: [
      faq("Photo size vs PDF size?", "Photo has its own KB limit; PDF is separate. Read both."),
      faq("Password-protected merge?", "Unlock first; portals often reject locked files."),
    ],
  }),
  topic({
    slug: "silver-rate-today-india-cities",
    section: "money",
    title: "Silver Rate Today in India — Why City Retail Prices Differ",
    shortTitle: "Silver rate",
    description:
      "Silver rate today in India: spot vs retail, making charges, city differences, and why a live ticker is not the price you pay at the counter.",
    keywords: [
      "silver rate today india",
      "silver price city wise",
      "spot vs retail silver",
      "silver making charges",
    ],
    readingMinutes: 8,
    clusterId: "sip-investing",
    relatedHref: "/goldverse",
    relatedLabel: "GoldVerse",
    blocks: [
      block("Spot is not retail", [
        "International/local spot moves; your jeweller adds making, GST, and local premia. Two cities differ because of taxes, logistics, and dealer books.",
      ]),
      block("How to compare a quote", [
        "Ask for silver rate, making per gram, and GST line separately. For coins/bars, making is often lower than jewellery — still confirm buyback.",
      ]),
    ],
    faqs: [
      faq("Is silver a SIP substitute?", "Different asset, different risk. Not advice."),
      faq("Live price on ContentVerse?", "Indicative context only."),
    ],
  }),
];

/** Canonical 30 ranking URLs (6 pillars + 24 topics) for hub + ItemList schema. */
export const TOP_30_GUIDE_PATHS: { href: string; label: string; intent: string }[] = [
  {
    href: "/guides/schemes/fastag-india-eligibility-recharge-faq",
    label: "FASTag India — buy, recharge, blacklist",
    intent: "fastag recharge / eligibility",
  },
  {
    href: "/guides/money/emi-calculator-india-guide",
    label: "EMI calculator — home, car, personal loans",
    intent: "emi calculator india",
  },
  {
    href: "/guides/money/sip-calculator-india-beginners-guide",
    label: "SIP for beginners in India",
    intent: "sip calculator / how to start",
  },
  {
    href: "/guides/money/ifsc-code-finder-india-guide",
    label: "IFSC codes — NEFT, RTGS, IMPS",
    intent: "ifsc code finder",
  },
  {
    href: "/guides/money/salary-tax-calculator-india-guide",
    label: "Salary tax — new vs old regime",
    intent: "income tax calculator salaried",
  },
  {
    href: "/guides/money/gst-calculator-india-freelancers-guide",
    label: "GST on invoices for freelancers",
    intent: "gst calculator india",
  },
  {
    href: "/guides/money/fd-vs-rd-india-guide",
    label: "FD vs RD — which savings plan",
    intent: "fd vs rd india",
  },
  {
    href: "/guides/money/ppf-account-india-guide",
    label: "PPF limit, lock-in, tax",
    intent: "ppf account rules",
  },
  {
    href: "/guides/money/credit-score-cibil-india-guide",
    label: "CIBIL / credit score without myths",
    intent: "improve cibil score",
  },
  {
    href: "/guides/schemes/upi-fraud-otp-scam-india",
    label: "UPI fraud — OTP scams & report",
    intent: "upi fraud what to do",
  },
  {
    href: "/guides/money/huid-hallmark-gold-buying-india",
    label: "HUID & hallmark gold checklist",
    intent: "huid verification gold",
  },
  {
    href: "/guides/money/highway-fuel-fastag-trip-planner",
    label: "Highway fuel + FASTag buffer",
    intent: "trip fuel cost india",
  },
  {
    href: "/guides/money/used-car-rc-rto-vahan-india",
    label: "Used car RC / Vahan checks",
    intent: "used car rc verification",
  },
  {
    href: "/guides/schemes/digital-arrest-scam-india",
    label: "Digital arrest scam red flags",
    intent: "digital arrest scam",
  },
  {
    href: "/guides/schemes/aadhaar-update-online-india",
    label: "Aadhaar address & mobile update",
    intent: "aadhaar update online",
  },
  {
    href: "/guides/schemes/ayushman-bharat-pmjay-eligibility",
    label: "Ayushman Bharat / PM-JAY eligibility",
    intent: "ayushman bharat eligibility",
  },
  {
    href: "/guides/money/hra-exemption-documents-india",
    label: "HRA exemption documents",
    intent: "hra exemption india",
  },
  {
    href: "/guides/money/section-80c-elss-ppf-lic-india",
    label: "Section 80C — ELSS vs PPF vs LIC",
    intent: "section 80c options",
  },
  {
    href: "/guides/money/gold-loan-vs-personal-loan-india",
    label: "Gold loan vs personal loan",
    intent: "gold loan vs personal loan",
  },
  {
    href: "/guides/money/credit-card-minimum-due-india",
    label: "Credit card minimum due trap",
    intent: "credit card minimum due",
  },
  {
    href: "/guides/money/50-30-20-budget-indian-salary",
    label: "50-30-20 budget on Indian salaries",
    intent: "50 30 20 rule india",
  },
  {
    href: "/guides/money/nifty-sensex-beginners-india",
    label: "Nifty & Sensex for beginners",
    intent: "nifty sensex explained",
  },
  {
    href: "/guides/money/when-to-stop-sip-mutual-fund",
    label: "When to stop or pause a SIP",
    intent: "when to stop sip",
  },
  {
    href: "/guides/money/content-creator-tax-gst-india",
    label: "Creator tax, GST & TDS",
    intent: "content creator tax india",
  },
  {
    href: "/guides/money/bank-statement-analysis-loan-india",
    label: "Bank statement checks for loans",
    intent: "bank statement analysis loan",
  },
  {
    href: "/guides/money/track-upi-expenses-phonepe-gpay",
    label: "Track PhonePe / GPay spends",
    intent: "track upi expenses",
  },
  {
    href: "/guides/schemes/pm-kisan-status-ekyc-pending",
    label: "PM-KISAN status & e-KYC pending",
    intent: "pm kisan status check",
  },
  {
    href: "/guides/jobs/sarkari-result-vs-scorecard",
    label: "Sarkari result vs scorecard",
    intent: "how to read sarkari result",
  },
  {
    href: "/guides/ai-tools/merge-pdf-job-application-india",
    label: "Merge PDF for job applications",
    intent: "merge pdf ssc application",
  },
  {
    href: "/guides/money/silver-rate-today-india-cities",
    label: "Silver rate today — city retail",
    intent: "silver rate today india",
  },
];
