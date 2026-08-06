/**
 * AdSense "low value content" boost — hand-written long-form India articles.
 * Seed with: npm run db:seed-adsense
 */
import type { ManualArticle } from "@/lib/seo/manual-articles";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=1600&auto=format&fit=crop`;

function article(
  intro: string,
  sections: { h: string; p: string; bullets?: string[] }[],
  faq?: { q: string; a: string }[],
  closing?: string
): string {
  const parts = [intro];
  for (const s of sections) {
    let block = `## ${s.h}\n\n${s.p}`;
    if (s.bullets?.length) {
      block += "\n\n" + s.bullets.map((b) => `- ${b}`).join("\n");
    }
    parts.push(block);
  }
  if (faq?.length) {
    parts.push("## FAQ");
    for (const f of faq) {
      parts.push(`### ${f.q}\n\n${f.a}`);
    }
  }
  if (closing) parts.push(closing);
  return parts.join("\n\n");
}

export const ADSENSE_BOOST_ARTICLES: ManualArticle[] = [
  {
    slug: "emergency-fund-india-how-much-to-save-2026",
    category: "finance",
    title: "Emergency Fund in India: How Much to Save in 2026",
    excerpt:
      "A practical guide to building 3–12 months of expenses in liquid Indian instruments — without freezing your long-term SIPs.",
    coverImage: img("photo-1579621970563-ebec7560ff3e"),
    tags: ["emergency-fund", "savings", "personal-finance", "india"],
    content: article(
      "An emergency fund is money you can reach within a day or two when income stops or a sudden expense hits — medical bills, job loss, or urgent travel. In India, the right size depends on whether you are salaried, a freelancer, or supporting dependents. This guide gives a clear framework you can apply this month, with realistic rupee examples and a refill plan after you withdraw.",
      [
        {
          h: "How many months of expenses do you need?",
          p: "Start by listing essential monthly costs only: rent or home EMI, groceries, utilities, school fees, insurance premiums, and minimum loan dues. Ignore dining out, OTT stacks, and shopping you can cut the same week. Salaried dual-income households often target 3–6 months of essentials. Single-income households, freelancers, commission-heavy roles, and people in volatile industries should lean toward 6–12 months. If you support ageing parents or have a dependent with medical needs, bias toward the higher end even if your job feels stable today.",
          bullets: [
            "Write essentials as a monthly rupee number — not a vague “enough”",
            "Exclude lifestyle costs you can pause within 48 hours",
            "Add one buffer month if your company is restructuring or your industry is cyclical",
          ],
        },
        {
          h: "Where to keep the money (liquidity first)",
          p: "Prioritise safety and access over return. A practical stack for many Indians is: one month in a savings account you can UPI/NEFT from same day; the next few months in a liquid mutual fund or sweep/flexi FD; and only surplus buffer in slightly longer FDs. Avoid locking the entire fund in multi-year FDs, NPS, or equities. Market instruments can fall exactly when you need cash. Also avoid parking the whole fund in a salary account you casually spend from — behavioural leakage is common.",
        },
        {
          h: "How to build it without stopping SIPs",
          p: "Automate a separate transfer on salary day labelled Emergency. Start with ₹2,000–₹5,000 if cash is tight, then raise the amount every appraisal or freelance payout. Pause discretionary EMIs and subscriptions before you pause retirement SIPs. If you get a bonus or arrears, split it: part lifestyle, part emergency top-up, part investments. Track progress monthly in a simple sheet with target, current balance, and months of cover.",
        },
        {
          h: "When you should actually use it",
          p: "Use the fund for true emergencies: income loss, critical health gaps after insurance, or unavoidable family crises. Do not use it for vacations, gadgets, or wedding upgrades. When you withdraw, write a refill plan within 30 days — even a small weekly transfer counts. Review insurance gaps after a medical withdrawal so the same shock does not empty the fund twice.",
        },
      ],
      [
        {
          q: "Is a credit card a substitute for an emergency fund?",
          a: "No. Cards help short cash-flow gaps but create interest risk if you cannot repay in full. An emergency fund prevents high-cost debt.",
        },
        {
          q: "Should freelancers keep more?",
          a: "Usually yes — aim closer to 9–12 months if invoices are irregular or clients pay late.",
        },
        {
          q: "Can I keep everything in a liquid mutual fund?",
          a: "Many people do for months 2 onward, but keep at least some cash in a bank account for same-day needs and weekends/holidays.",
        },
      ],
      "## Key takeaway\n\nBuild a liquid buffer first, then invest aggressively. Security makes long-term compounding possible. Educational content only — not personalised financial advice."
    ),
  },
  {
    slug: "nps-vs-ppf-vs-elss-tax-saving-india-comparison",
    category: "finance",
    title: "NPS vs PPF vs ELSS: Tax-Saving Comparison for Indian Salaried Employees",
    excerpt:
      "Compare lock-ins, returns potential, and tax treatment so you pick the right mix for Section 80C and retirement.",
    coverImage: img("photo-1554224155-6726b3ff858f"),
    tags: ["nps", "ppf", "elss", "tax-saving", "80c"],
    content: article(
      "Indian salaried employees often rush into tax-saving products in March. A calmer approach is to match each instrument to a goal: retirement, safety, or market-linked growth. Here is a practical comparison of NPS, PPF, and ELSS so you can plan before the financial year closes — not in a last-week panic.",
      [
        {
          h: "PPF — safety and long lock-in",
          p: "Public Provident Fund suits conservative savers who want sovereign-backed returns and Section 80C benefits. The long horizon (typically 15 years with extension options) means you should only park money you will not need for a decade-plus. Partial withdrawals and loans have rules; treat PPF as a safety core, not an emergency fund. Interest rates are notified periodically — do not assume last year’s rate forever.",
        },
        {
          h: "ELSS — market-linked with 3-year lock",
          p: "Equity Linked Savings Schemes offer one of the shortest lock-ins among popular 80C equity options. Returns are not guaranteed and can be volatile over short periods. ELSS works better if you already have an emergency fund and a horizon of five years or more. Compare expense ratios and consistency, not just last year’s top performer. SIP into ELSS through the year beats a March lump sum for most people.",
        },
        {
          h: "NPS — retirement focused with extra deduction",
          p: "National Pension System can add retirement discipline and an additional deduction under Section 80CCD(1B) subject to current rules. Understand equity allocation choices, exit rules, and annuity requirements before committing large sums. NPS is less flexible than a mutual fund folio — that rigidity is a feature for retirement, not for near-term goals.",
        },
        {
          h: "A simple allocation approach",
          p: "Many households combine EPF (if employed), a PPF core for safety, ELSS for growth within 80C, and NPS for extra retirement saving. If your 80C is already filled by EPF and home-loan principal, do not force more illiquid products just for tax — evaluate NPS’s extra deduction and your cash flow instead. Run numbers with your CA or a reliable tax utility before year-end.",
          bullets: [
            "Map each rupee to a goal before chasing tax savings",
            "Do not over-lock money needed in 2–3 years",
            "Revisit allocation after job changes or big life events",
          ],
        },
      ],
      [
        {
          q: "Can I invest in all three?",
          a: "Yes, if cash flow allows — but avoid stacking lock-ins that leave you cash-poor.",
        },
        {
          q: "Is ELSS safer than stocks?",
          a: "ELSS is still equity market risk, just packaged with a lock-in and tax benefit. It is not a fixed-income product.",
        },
      ],
      "## Disclaimer\n\nEducational content only, not tax advice. Limits and rules change — verify on the Income Tax e-filing portal and with a qualified advisor."
    ),
  },
  {
    slug: "first-home-loan-checklist-india-salaried",
    category: "finance",
    title: "First Home Loan Checklist for Salaried Buyers in India",
    excerpt:
      "Documents, eligibility, hidden costs, and negotiation tips before you sign a home loan for your first flat.",
    coverImage: img("photo-1560518883-ce09059eeffa"),
    tags: ["home-loan", "real-estate", "emi", "india"],
    content: article(
      "Buying a first home is exciting and stressful. Banks look at income stability, existing EMIs, credit score, and property paperwork. Use this checklist before you pay a large booking amount so you do not discover deal-breakers after the token is paid.",
      [
        {
          h: "Check eligibility before you fall in love with a flat",
          p: "Estimate EMI capacity using take-home pay, existing loans, and bank FOIR norms. Keep buffer for rate rises. Compare offers from your salary bank and at least one housing finance company. A pre-approved offer is useful for negotiation but not a blank cheque — final sanction still depends on property and paperwork.",
        },
        {
          h: "Documents you will almost always need",
          p: "Keep KYC, PAN, Aadhaar, salary slips, Form 16 / ITRs, bank statements, and employment proof ready in a labelled folder (digital + print). For the property: title chain, approved plans, occupancy certificate / completion as applicable, and society or builder NOCs. Incomplete documents slow disbursement and can kill registration timelines.",
        },
        {
          h: "Hidden costs beyond the EMI",
          p: "Budget stamp duty, registration, GST where applicable on under-construction, interior basics, moving, and society deposits. Processing fees, valuation charges, and legal fees also add up. Ask whether rate is floating, what the reset clause looks like, and whether prepayment penalties apply.",
          bullets: [
            "Ask for a written list of all fees before paying processing charges",
            "Model EMI at +1% interest to stress-test affordability",
            "Keep 6+ months of EMIs as a separate buffer if possible",
          ],
        },
        {
          h: "Negotiation and red flags",
          p: "Negotiate on rate, processing fee waivers, and insurance bundling. Be wary of pressure to book immediately, incomplete RERA details, or “cash component” requests. Visit the site, talk to existing residents if possible, and verify the seller’s authority to sell.",
        },
      ],
      [
        {
          q: "Should I choose a shorter tenure?",
          a: "Shorter tenure cuts interest but raises EMI. Choose what keeps FOIR comfortable with a rate-rise buffer.",
        },
        {
          q: "Is joint application better?",
          a: "Often yes for eligibility if both incomes are stable — but both parties share liability. Understand the implications clearly.",
        },
      ],
      "## Key takeaway\n\nAffordability and clean paperwork beat the prettiest brochure. Educational only — not lending or legal advice."
    ),
  },
  {
    slug: "upi-autopay-mandates-safety-guide-india",
    category: "finance",
    title: "UPI Autopay Mandates in India: How They Work and How to Stay Safe",
    excerpt:
      "Understand e-mandates for SIPs, OTT, rent, and utility bills — plus how to revoke, monitor, and avoid mandate scams.",
    coverImage: img("photo-1556742049-0cfed4f6a45d"),
    tags: ["upi", "autopay", "fintech", "safety", "india"],
    content: article(
      "UPI Autopay lets merchants pull recurring payments after you approve a mandate. It is convenient for SIPs, subscriptions, and bills — and risky if you approve blindly. This guide explains how mandates work for Indian users and how to stay in control.",
      [
        {
          h: "What a mandate actually authorises",
          p: "When you set Autopay, you typically approve a maximum amount, frequency, and validity period. The merchant can collect within those limits without asking every time. Always read the mandate screen: amount cap, start date, and end date matter more than the logo.",
        },
        {
          h: "Good uses vs risky approvals",
          p: "Good uses include mutual fund SIPs, known utilities, and subscriptions you actively use. Risky approvals include unknown apps, “verification” requests, and mandates with unusually high caps. Scammers may push you to approve a mandate while claiming it is a refund or KYC step.",
          bullets: [
            "Never approve a mandate from an unexpected SMS or WhatsApp link",
            "Prefer low caps and short validity when testing a new service",
            "Screenshot the mandate details after approval",
          ],
        },
        {
          h: "How to monitor and revoke",
          p: "Check your UPI app’s mandate or Autopay section regularly. Revoke unused subscriptions immediately after cancelling a service. Watch bank SMS for unexpected pulls. If a debit looks wrong, contact the bank/UPI app support quickly and document the merchant name and UTR.",
        },
        {
          h: "Household tip",
          p: "Maintain a shared note of active Autopays for the family: merchant, amount, date, and which UPI ID. This prevents double subscriptions and helps when someone loses a phone.",
        },
      ],
      [
        {
          q: "Can a merchant pull more than the cap?",
          a: "They should not. If it happens, escalate with your bank/UPI app with evidence. Prevention still starts with low caps.",
        },
        {
          q: "Is Autopay safer than sharing card details?",
          a: "For many recurring Indian payments, UPI mandates are convenient — but safety depends on your approval hygiene either way.",
        },
      ],
      "## Key takeaway\n\nTreat every mandate screen like a standing instruction at a bank counter: read limits, then approve."
    ),
  },
  {
    slug: "credit-score-improve-india-practical-30-day-plan",
    category: "finance",
    title: "Improve Your Credit Score in India: A Practical 30-Day Plan",
    excerpt:
      "Actionable steps for CIBIL and bureau hygiene — payments, utilisation, errors, and what not to do in a hurry.",
    coverImage: img("photo-1554224154-26032ffc0d07"),
    tags: ["credit-score", "cibil", "loans", "india"],
    content: article(
      "A stronger credit score makes personal loans, credit cards, and home loans cheaper and easier. You cannot magically jump 100 points overnight, but 30 days of disciplined actions can stop damage and start repair. This plan is for Indian borrowers checking CIBIL or other bureaux.",
      [
        {
          h: "Week 1 — Know the truth",
          p: "Pull your credit report from a legitimate source. List every account, recent enquiries, and overdue amounts. Note errors: closed loans still showing open, wrong personal details, or unfamiliar accounts. Dispute clear errors through the bureau process with documents.",
        },
        {
          h: "Week 2 — Stop the bleeding",
          p: "Pay every EMI and card bill on time — even minimum dues if cash is tight, then catch up. Set calendar reminders three days before due dates. Autopay helps if your balance is reliable. Late payments hurt more than almost any other short-term factor.",
        },
        {
          h: "Week 3 — Fix utilisation and mix",
          p: "High credit-card utilisation can drag scores even when you pay on time. Pay down revolving balances, especially cards near limit. Avoid opening multiple new accounts in a rush — enquiry spikes look desperate. Do not close your oldest healthy card without thinking; age of history matters.",
          bullets: [
            "Target keeping card utilisation comfortably under ~30% where possible",
            "Prioritise high-interest revolving debt",
            "Avoid loan stacking apps that report poorly",
          ],
        },
        {
          h: "Week 4 — Systemise",
          p: "Create a monthly money date: check dues, utilisation, and any new enquiries. If you need credit for a real goal, wait until reports reflect recent on-time behaviour. Be patient — bureaux update on cycles, not instantly.",
        },
      ],
      [
        {
          q: "Do credit repair agencies guarantee a score?",
          a: "Be sceptical of guarantees. Legitimate help focuses on disputes and repayment discipline, not shortcuts.",
        },
        {
          q: "Will checking my own score hurt it?",
          a: "Soft checks for your own report typically do not hurt the way hard lender enquiries can.",
        },
      ],
      "## Disclaimer\n\nEducational content. Scoring models and lender policies vary."
    ),
  },
  {
    slug: "switch-jobs-india-notice-period-negotiation-guide",
    category: "career",
    title: "Switching Jobs in India: Notice Period, Buyouts & Negotiation",
    excerpt:
      "How to handle 30–90 day notices, relieving letters, and offer timelines without burning bridges.",
    coverImage: img("photo-1521737711867-e3b97375f902"),
    tags: ["jobs", "notice-period", "negotiation", "india-careers"],
    content: article(
      "Indian IT and corporate roles often come with 60–90 day notice periods. Offers expire, managers negotiate buyouts, and relieving letters become blockers. This guide helps you plan a clean switch without panic.",
      [
        {
          h: "Read your current contract first",
          p: "Check notice length, buyout clauses, garden leave, and bond/training recovery terms. HR policy PDFs matter as much as verbal assurances. Know whether leave during notice is allowed and how final settlement works.",
        },
        {
          h: "Align the new employer early",
          p: "Share a realistic joining date in writing. Ask whether they support notice buyout and what documents they need (relieving letter, experience letter, last payslips). Do not resign until key offer terms are in writing — CTC, role, location/remote, and joining date.",
        },
        {
          h: "Negotiation levers that actually work",
          p: "Propose a documented knowledge-transfer plan, overlapping overlap with a buddy, and priority delivery of critical tickets. Some teams reduce notice when risk is managed. Buyouts may be shared — clarify who pays and how it appears in settlement.",
          bullets: [
            "Keep resignation professional and short",
            "Save emails of approvals",
            "Do not badmouth your current team on LinkedIn during notice",
          ],
        },
        {
          h: "Common pitfalls",
          p: "Ghosting HR, accepting two overlapping offers without disclosure, or assuming FN/F&F will be instant. Also watch gardening of access: export personal documents before systems lock, within policy.",
        },
      ],
      [
        {
          q: "Can a company legally force 90 days always?",
          a: "It depends on your contract and applicable law. Many disputes are practical (relieving letter) more than courtroom fights. Get advice for edge cases.",
        },
        {
          q: "Should I tell my manager I am interviewing?",
          a: "Usually after you have a written offer. Early disclosure can help or hurt depending on culture — judge carefully.",
        },
      ],
      "## Key takeaway\n\nPlan paperwork and dates as carefully as you plan CTC negotiation."
    ),
  },
  {
    slug: "linkedin-profile-india-job-seekers-2026-checklist",
    category: "career",
    title: "LinkedIn Profile Checklist for Indian Job Seekers (2026)",
    excerpt:
      "Headline, About, featured work, and outreach templates that work for India hiring managers and recruiters.",
    coverImage: img("photo-1611944212129-29977ae1398c"),
    tags: ["linkedin", "job-search", "careers", "india"],
    content: article(
      "Recruiters in India still use LinkedIn heavily for tech, product, sales, and corporate roles. A vague headline and empty Featured section waste good experience. Use this checklist to make your profile searchable and credible in 2026.",
      [
        {
          h: "Headline that states value, not just title",
          p: "Replace “Seeking opportunities” with role + domain + proof. Example: “Backend engineer | Fintech APIs | Reduced p95 latency 40%”. Include keywords hiring managers search: React, Salesforce, CA articleship, campus hiring, etc.",
        },
        {
          h: "About section with a clear story",
          p: "Write 4–6 short paragraphs: who you help, what you have shipped, stack/tools, and what you want next. Add a soft CTA: open to roles in X cities / remote. Avoid buzzword salad.",
        },
        {
          h: "Experience bullets that quantify",
          p: "Use impact bullets: problem → action → result. Numbers beat adjectives. Link to public demos, GitHub, case studies, or publications in Featured. For freshers, highlight internships, college projects with users, and hackathon outcomes.",
          bullets: [
            "Custom URL with your name",
            "Professional photo and clean banner",
            "Skills endorsed that match your target JD",
            "Open-to-work visibility settings chosen intentionally",
          ],
        },
        {
          h: "Outreach that does not spam",
          p: "Short notes beat essays. Mention a specific post or product of theirs, one line on fit, and a clear ask for a 15-minute chat. Follow up once. Track applications in a sheet so you do not double-message.",
        },
      ],
      [
        {
          q: "Does Open to Work green banner hurt?",
          a: "Some prefer recruiter-only mode. Test what matches your risk comfort and current employer situation.",
        },
      ],
      "## Key takeaway\n\nMake the profile easy to scan in 20 seconds — then prove depth in Experience and Featured."
    ),
  },
  {
    slug: "fresher-interview-prep-india-dsa-system-basics",
    category: "career",
    title: "Fresher Interview Prep in India: DSA + System Basics Without Burnout",
    excerpt:
      "A realistic 6–8 week plan for campus and off-campus tech interviews — patterns, projects, and HR rounds.",
    coverImage: img("photo-1516321318423-f06f85e504b3"),
    tags: ["interviews", "dsa", "freshers", "campus-placement"],
    content: article(
      "Campus and off-campus tech hiring in India still leans on DSA plus a project discussion. Many students either grind randomly or freeze. This plan balances patterns, communication, and rest so you can perform on interview day.",
      [
        {
          h: "Pick a pattern syllabus, not 500 random problems",
          p: "Focus on arrays, hashing, two pointers, sliding window, recursion/backtracking basics, trees, graphs intro, and heaps. Re-solve problems after 3–5 days. Write clean code with complexity spoken out loud.",
        },
        {
          h: "Projects that survive follow-ups",
          p: "One solid project beats five tutorials. Be ready to explain architecture, trade-offs, bugs you fixed, and what you would improve. Deploy if possible. For non-CS roles, prepare domain case studies instead of forced LeetCode theatre.",
        },
        {
          h: "Weekly rhythm",
          p: "Example: 5 focused DSA days, 1 project/system day, 1 light review + mock. Sleep matters — fatigue looks like incompetence. Record yourself explaining a solution once a week.",
          bullets: [
            "Keep a mistake journal",
            "Practice on a whiteboard or plain editor, not only IDE autocomplete",
            "Prepare 2–3 behavioural stories (conflict, failure, leadership)",
          ],
        },
        {
          h: "HR and offer basics",
          p: "Know your notice (if any), expected CTC range from research, and location constraints. Be honest about gaps. Send thank-you notes only if genuine and short.",
        },
      ],
      [
        {
          q: "Do I need system design as a fresher?",
          a: "Basics help: client-server, databases, caching at a high level. Deep distributed design is usually for experienced hires.",
        },
      ],
      "## Key takeaway\n\nConsistency beats heroic all-nighters before the online assessment."
    ),
  },
  {
    slug: "remote-jobs-india-how-to-evaluate-offers",
    category: "career",
    title: "Remote Jobs from India: How to Evaluate Offers Safely",
    excerpt:
      "Payroll, time zones, equipment, tax, and red flags when foreign or Indian remote employers reach out.",
    coverImage: img("photo-1522202176988-66273c2fd55f"),
    tags: ["remote-work", "jobs", "india", "offers"],
    content: article(
      "Remote roles can be excellent for Indian professionals — or a payroll nightmare. Before you resign, evaluate the offer beyond headline USD/INR numbers.",
      [
        {
          h: "Who employs you on paper?",
          p: "Clarify whether you are on an Indian entity, EOR/payroll partner, or contractor invoice. Each path has different PF, tax TDS, and benefits implications. Ask how invoices are paid and typical payment timelines.",
        },
        {
          h: "Time zones and expectations",
          p: "Overlapping US/EU hours can mean late evenings. Confirm core hours, on-call, and meeting load in writing. Sustainable remote beats a 30% salary bump that destroys sleep.",
        },
        {
          h: "Equipment, security, and data",
          p: "Who pays for laptop? Is MDM required? Are client data policies clear? For contractor setups, understand IP assignment clauses before you sign.",
          bullets: [
            "Verify company domain email and LinkedIn presence",
            "Beware employers asking you to pay for “training kits” or “processing”",
            "Keep offer letters and tax docs organised",
          ],
        },
        {
          h: "Compensation comparison",
          p: "Convert carefully: benefits, employer taxes, equipment, and currency risk. An Indian full-time offer with PF and gratuity can beat a slightly higher contractor rate after costs.",
        },
      ],
      [
        {
          q: "Are remote foreign salaries always better?",
          a: "Not always after tax, benefits, and hours. Model net monthly lifestyle, not just gross.",
        },
      ],
      "## Disclaimer\n\nNot legal or tax advice — consult a CA for cross-border contracting."
    ),
  },
  {
    slug: "government-job-exams-india-study-system-working-professionals",
    category: "career",
    title: "Government Job Exams in India: A Study System for Working Professionals",
    excerpt:
      "How to prepare for SSC, banking, and state exams without quitting your job — routines, materials, and burnout control.",
    coverImage: img("photo-1434030216411-0b793f4b4173"),
    tags: ["government-jobs", "ssc", "banking-exams", "study-plan"],
    content: article(
      "Lakhs of working Indians prepare for government exams while holding a job. The constraint is time, not motivation posters. Build a system that survives overtime weeks and family obligations.",
      [
        {
          h: "Choose one primary target",
          p: "Split focus across SSC, banking, state PSC, and Railways dilutes progress. Pick a primary exam cycle and treat others as secondary only if syllabi overlap heavily.",
        },
        {
          h: "A realistic weekly hour budget",
          p: "Many working aspirants can protect 10–14 focused hours weekly. Use early mornings or late evenings consistently. Weekends for mocks. Protect sleep — drowsy study is fake progress.",
        },
        {
          h: "Materials and mocks",
          p: "Limit yourself to one core source per subject plus previous papers. Track accuracy and time. Review mistakes the same day. Current affairs: short daily notes beat monthly binge reading.",
          bullets: [
            "Phone outside the study room when possible",
            "One mock → deep analysis → topic repair",
            "Monthly health check: eyes, posture, stress",
          ],
        },
        {
          h: "When life interrupts",
          p: "Have a minimum viable day (30–40 minutes) so streaks do not die. After a bad week, restart without drama. If your job is crushing preparation for months, reconsider timeline honestly.",
        },
      ],
      [
        {
          q: "Should I quit my job to prepare?",
          a: "Only with a financial runway and a clear plan. Many clear exams while working; quitting is not automatically better.",
        },
      ],
      "## Key takeaway\n\nConsistency and mock analysis beat collecting new PDFs."
    ),
  },
  {
    slug: "learn-python-india-career-paths-2026",
    category: "technology",
    title: "Learn Python in India: Career Paths That Still Make Sense in 2026",
    excerpt:
      "From automation and data to backend and AI-adjacent roles — how beginners in India should learn Python with projects.",
    coverImage: img("photo-1526374965328-7f61d4dc18c5"),
    tags: ["python", "programming", "careers", "india"],
    content: article(
      "Python remains one of the most practical first languages for Indian learners because it opens automation, data, backend, and AI-adjacent doors. The mistake is finishing 20 courses with zero projects. Here is a path that employers recognise.",
      [
        {
          h: "Fundamentals that actually matter",
          p: "Get comfortable with syntax, data structures, functions, modules, virtual environments, and reading errors. Learn to use git. Practice on small problems daily for four weeks before chasing frameworks.",
        },
        {
          h: "Pick a lane with a portfolio project",
          p: "Automation: scripts that clean Excel/CSV and send reports. Data: analysis notebook on a public dataset with charts and conclusions. Backend: a small FastAPI/Django app with auth. AI-adjacent: a RAG demo only after basics — do not skip engineering hygiene.",
        },
        {
          h: "India hiring signals",
          p: "Recruiters look for clarity in README, deployed demos, and the ability to explain trade-offs. Internships, open source, and college clubs help. For career switchers, show domain + Python (finance ops automation, marketing analytics, etc.).",
          bullets: [
            "One GitHub repo you are proud to walk through",
            "Write tests for at least part of your project",
            "Learn SQL alongside Python — it multiplies job options",
          ],
        },
        {
          h: "Avoid these traps",
          p: "Certificate hoarding, tutorial hell, and copying projects you cannot explain. Also ignore hype that “AI replaces learning fundamentals.” AI tools help faster once you can read and fix code.",
        },
      ],
      [
        {
          q: "Is Python enough for FAANG-style interviews?",
          a: "Language is fine; you still need DSA and strong problem-solving. Python can be your interview language if you are fluent.",
        },
      ],
      "## Key takeaway\n\nShip small real tools. Courses are inputs; projects are proof."
    ),
  },
  {
    slug: "smartphone-privacy-settings-india-whatsapp-upi-apps",
    category: "technology",
    title: "Smartphone Privacy Settings for India: WhatsApp, UPI & Everyday Apps",
    excerpt:
      "Practical privacy hardening for Android and iPhone users who live on UPI, WhatsApp, and popular Indian apps.",
    coverImage: img("photo-1563986768609-322da13575f3"),
    tags: ["privacy", "smartphone", "whatsapp", "upi", "security"],
    content: article(
      "Indian smartphone users run banking, chats, and government services on the same device. Perfect privacy is unrealistic; better defaults are not. These settings reduce casual risk without making your phone unusable.",
      [
        {
          h: "Lock screen and accounts",
          p: "Use a strong device passcode/biometrics. Avoid repeating your bank PIN as the phone PIN. Review Google/Apple account recovery options. Enable find-my-device features you trust.",
        },
        {
          h: "WhatsApp and messaging",
          p: "Turn on encryption backups thoughtfully, limit who can add you to groups, and be careful with linked devices. Do not approve unexpected device link prompts. Treat viral forwards that ask for OTPs or KYC links as hostile.",
        },
        {
          h: "UPI and banking apps",
          p: "Install apps from official stores. Never share UPI PINs or SMS OTPs. Review app permission lists — a flashlight app does not need contacts. Revoke unused UPI Autopay mandates. Keep OS and banking apps updated.",
          bullets: [
            "Disable install from unknown sources unless you truly need it",
            "Review notification content on lock screen for banking SMS",
            "Use separate profiles/work profiles if your OEM supports them well",
          ],
        },
        {
          h: "Permissions spring-cleaning",
          p: "Once a quarter, open App permissions and revoke location, mic, and camera access for apps that do not need them daily. Delete apps you have not opened in months.",
        },
      ],
      [
        {
          q: "Is iPhone automatically safer than Android?",
          a: "Both can be secure with updates and good habits. Sideloading risk and delayed updates matter more than brand slogans.",
        },
      ],
      "## Key takeaway\n\nPrivacy is mostly habits: updates, least privilege, and scepticism toward urgency scams."
    ),
  },
  {
    slug: "buy-broadband-vs-5g-home-internet-india",
    category: "technology",
    title: "Broadband vs 5G Home Internet in India: How to Choose",
    excerpt:
      "Compare fibre broadband and 5G fixed wireless for WFH, streaming, and apartment constraints in Indian cities.",
    coverImage: img("photo-1544191696-102dbdaeeaa0"),
    tags: ["broadband", "5g", "internet", "wfh", "india"],
    content: article(
      "Work-from-home and streaming made home internet a utility. In many Indian apartments you choose between fibre broadband and 5G-based home internet. The right answer depends on coverage, wiring permissions, and how you work.",
      [
        {
          h: "When fibre usually wins",
          p: "Stable latency for video calls, higher symmetrical speeds in good networks, and better multi-device households. If your society already has fibre and installation is allowed, start there. Check peak-hour speed test reports from neighbours if possible.",
        },
        {
          h: "When 5G home internet makes sense",
          p: "No fibre permission, temporary rentals, or strong indoor 5G coverage. It can be excellent — or inconsistent if the cell is congested. Test during your actual work hours before you cancel fibre.",
        },
        {
          h: "Checklist before you pay annual plans",
          p: "Ask about fair usage policies, router quality, static IP needs for work, installation fees, and exit clauses. For gaming and frequent calls, run latency tests, not only download speed vanity numbers.",
          bullets: [
            "Place the router centrally; avoid cupboard burial",
            "Use Ethernet for your primary work machine when possible",
            "Keep a mobile hotspot fallback for outage days",
          ],
        },
      ],
      [
        {
          q: "Is higher Mbps always better?",
          a: "Not if latency and packet loss are poor. A stable 100 Mbps often beats unstable 500 Mbps for calls.",
        },
      ],
      "## Key takeaway\n\nTest under your real workload, then commit to long prepaid plans."
    ),
  },
  {
    slug: "cybersecurity-basics-small-business-india",
    category: "technology",
    title: "Cybersecurity Basics for Small Businesses in India",
    excerpt:
      "Password hygiene, payments fraud, employee access, and backups — a starter security checklist for Indian SMEs.",
    coverImage: img("photo-1555949963-aa79dcee981c"),
    tags: ["cybersecurity", "sme", "business", "india"],
    content: article(
      "Indian small businesses lose money to invoice fraud, fake UPI requests, and mailbox takeovers more often than Hollywood-style hacks. You do not need an enterprise SOC on day one — you need basics done consistently.",
      [
        {
          h: "Identity and email first",
          p: "Turn on MFA for Google Workspace/Microsoft 365 and banking portals. Use a password manager. Stop shared WhatsApp-only “admin passwords.” Compromise of owner email is often enough to redirect vendor payments.",
        },
        {
          h: "Payments and vendor verification",
          p: "Confirm bank detail changes on a known phone number, not only email. Train staff against urgent payment scams. Dual control for large transfers helps even in a 5-person team.",
        },
        {
          h: "Devices and backups",
          p: "Keep OS updated, disk encryption on, and automatic backups of accounting data (with an offline/cold copy). Lost laptops without encryption are data breaches.",
          bullets: [
            "Least-privilege access to Tally/books and drive folders",
            "Offboard employees the same day — revoke mail and VPN",
            "Write a one-page incident plan: who to call, what to freeze",
          ],
        },
      ],
      [
        {
          q: "Do we need expensive antivirus?",
          a: "Start with updates, MFA, backups, and browser hygiene. Add endpoint tools as you grow — process beats stickers.",
        },
      ],
      "## Key takeaway\n\nMost SME breaches are preventable with MFA, verification calls, and backups."
    ),
  },
  {
    slug: "ai-tools-for-indian-freelancers-writing-design-code",
    category: "ai",
    title: "AI Tools for Indian Freelancers: Writing, Design & Code Without Losing Clients",
    excerpt:
      "Where AI helps delivery speed — and where disclosing, editing, and craft still win retainers.",
    coverImage: img("photo-1677442136019-21780ecad995"),
    tags: ["ai-tools", "freelancers", "india", "productivity"],
    content: article(
      "Freelancers in India use AI to draft, debug, and ideate. Clients still pay for taste, accountability, and originality. Used well, AI raises throughput; used lazily, it destroys trust and SEO-quality reputation.",
      [
        {
          h: "Good uses",
          p: "Outlines, boilerplate, research summaries, test cases, alt text drafts, and first-pass edits. Always fact-check names, prices, laws, and medical/financial claims. Keep a personal swipe file of your best human work so AI does not flatten your voice.",
        },
        {
          h: "Risky uses",
          p: "Shipping unedited AI copy, inventing citations, ignoring brand voice, or delivering copyrighted-looking assets you cannot defend. For code, never paste secrets into random tools; use approved environments.",
        },
        {
          h: "A simple workflow",
          p: "Brief → AI draft → human rewrite → client examples → deliver. Price your judgment, not raw words. For retainers, document how AI is used if contracts require disclosure.",
          bullets: [
            "Build checklists for hallucinations common in your niche",
            "Keep version history of human edits",
            "Use AI for options, then choose deliberately",
          ],
        },
      ],
      [
        {
          q: "Should I tell clients I use AI?",
          a: "When policies or contracts require it, yes. Otherwise focus on quality; many clients care about outcomes more than tools — until quality slips.",
        },
      ],
      "## Key takeaway\n\nAI is an intern that never sleeps. You remain the editor-in-chief."
    ),
  },
  // —— Week 2: 10 more strong posts ——
  {
    slug: "sip-vs-lumpsum-mutual-funds-india-guide",
    category: "finance",
    title: "SIP vs Lumpsum in India: Which Works Better for Mutual Funds?",
    excerpt:
      "Behaviour, market timing risk, and practical rules for salaried investors choosing SIP or lumpsum.",
    coverImage: img("photo-1611974789855-9c2a0a7236a3"),
    tags: ["sip", "mutual-funds", "investing", "india"],
    content: article(
      "SIP vs lumpsum is one of the most searched investing questions in India. The honest answer depends on cash-flow timing, emergency fund status, and temperament — not a viral reel.",
      [
        {
          h: "What SIP optimises for",
          p: "SIPs automate investing from salary, reduce timing stress, and build habit. They shine when money arrives monthly and markets are uncertain. SIPs do not guarantee profits; they average purchase price over time.",
        },
        {
          h: "When lumpsum can make sense",
          p: "Bonus, inheritance, or matured FD money that would otherwise sit idle may be invested in stages (for example, over 3–6 months) if your emergency fund is ready and horizon is long. Dumping everything at an all-time-high peak because of FOMO is the behavioural failure mode.",
        },
        {
          h: "A practical hybrid",
          p: "Keep SIPs running for salary. For windfalls, stagger entries while staying invested in the same asset allocation plan. Rebalance yearly. Ignore day-to-day NAV anxiety if your goal is 7+ years away.",
          bullets: [
            "Emergency fund before aggressive equity",
            "Match equity share to time horizon",
            "Use ContentVerse SIP calculator for planning maths — not as advice",
          ],
        },
      ],
      [
        {
          q: "Is SIP always safer?",
          a: "SIP reduces timing risk psychologically; market risk remains. Safety comes from allocation and horizon, not the SIP label alone.",
        },
      ],
      "## Disclaimer\n\nEducational only. Mutual fund investments are subject to market risks."
    ),
  },
  {
    slug: "section-80c-checklist-salaried-india-fy",
    category: "finance",
    title: "Section 80C Checklist for Salaried Employees in India",
    excerpt:
      "EPF, PPF, ELSS, life insurance, tuition fees and more — a calm year-round checklist so March is not a scramble.",
    coverImage: img("photo-1554224155-8d04cb21cd6c"),
    tags: ["80c", "tax", "salaried", "india"],
    content: article(
      "Section 80C is often treated as a March shopping list. Better: map what you already contribute (EPF, home-loan principal, tuition) and only then add instruments that match goals.",
      [
        {
          h: "Count what is already happening",
          p: "Check payslips for EPF. Add eligible home-loan principal and children’s tuition fees if applicable. Many employees discover they are closer to the limit than they thought.",
        },
        {
          h: "Fill gaps with goal-matched products",
          p: "If you still have room, prefer products you would buy without tax benefits: PPF for long safety, ELSS for long equity, etc. Avoid locking money only to “save tax” if you need liquidity next year.",
        },
        {
          h: "Paperwork hygiene",
          p: "Keep proofs organised for your employer’s investment declaration and for ITR. Deadlines and portal UX change — verify current FY rules on official sources.",
          bullets: [
            "Do not double-count the same investment",
            "Review insurance needs separately from tax selling",
            "Use salary-tax tools for estimates, then confirm with Form 16 logic",
          ],
        },
      ],
      [
        {
          q: "Is the 80C limit the same every year?",
          a: "Limits and rules can change with budgets. Always verify for the current financial year.",
        },
      ],
      "## Disclaimer\n\nNot tax advice."
    ),
  },
  {
    slug: "rent-agreement-india-tenant-checklist",
    category: "lifestyle",
    title: "Rent Agreement in India: Tenant Checklist Before You Pay Token",
    excerpt:
      "Deposit, lock-in, maintenance, police verification, and inventory — protect yourself in India’s rental market.",
    coverImage: img("photo-1560518883-ce09059eeffa"),
    tags: ["rent", "tenant", "housing", "india"],
    content: article(
      "Rental horror stories usually start with rushed WhatsApp deals. Slow down before token money. A clear agreement saves months of stress.",
      [
        {
          h: "Verify the landlord’s right to rent",
          p: "Ask for ownership proof or authority to lease. In societies, check if landlord permissions are needed. Meet at the property when possible.",
        },
        {
          h: "Clauses that matter",
          p: "Deposit amount and refund timeline, lock-in, notice period, rent escalation, maintenance responsibility, guest rules, and who pays minor repairs. Get inventories of fans, geysers, and fittings with photos on move-in day.",
        },
        {
          h: "Registration and local norms",
          p: "Rules on registration and stamp duty vary by state and tenure. Follow local requirements. Keep digital copies of the signed agreement and payment receipts.",
          bullets: [
            "Never pay large sums in undocumented cash",
            "Clarify brokerage and who pays it",
            "Note meter readings on day one",
          ],
        },
      ],
      [
        {
          q: "Is a notarised agreement enough everywhere?",
          a: "Requirements differ by state and situation. When in doubt, ask a local lawyer for high-value deposits.",
        },
      ],
      "## Key takeaway\n\nPhotos + written terms beat verbal promises."
    ),
  },
  {
    slug: "pf-withdrawal-vs-transfer-job-change-india",
    category: "finance",
    title: "PF on Job Change in India: Withdraw vs Transfer",
    excerpt:
      "What usually makes sense for EPF when you switch employers — continuity, UAN, and common mistakes.",
    coverImage: img("photo-1450101499163-c8848c66ca85"),
    tags: ["epf", "pf", "job-change", "india"],
    content: article(
      "Changing jobs triggers a common question: withdraw PF or transfer? For most long-term workers, keeping retirement money invested via transfer is the default — but process details matter.",
      [
        {
          h: "Why transfer is often wiser",
          p: "Transfer preserves continuity of service and compounding. Early withdrawals can have tax and long-term shortfall consequences depending on rules and timing. Treat PF as retirement infrastructure, not a bonus.",
        },
        {
          h: "UAN and KYC hygiene",
          p: "Ensure UAN is active, Aadhaar/PAN/bank KYC is seeded correctly, and previous employment details are accurate. Mismatched details cause claim failures.",
        },
        {
          h: "When people still withdraw",
          p: "Genuine unemployment gaps or specific eligible conditions may allow withdrawals under rules. Read current EPFO guidance; do not rely on canteen folklore. If you withdraw, rebuild retirement saving deliberately.",
          bullets: [
            "Download passbook before and after transfer",
            "Follow up with both employers’ HR if pending",
            "Beware of agents asking for OTPs",
          ],
        },
      ],
      [
        {
          q: "How long does transfer take?",
          a: "It varies. Track claim status and keep HR contacts handy.",
        },
      ],
      "## Disclaimer\n\nEPFO rules change — verify on official portals."
    ),
  },
  {
    slug: "gst-basics-freelancers-sole-proprietors-india",
    category: "business",
    title: "GST Basics for Freelancers and Sole Proprietors in India",
    excerpt:
      "When registration may apply, invoices, and common mistakes — an educational primer for solo operators.",
    coverImage: img("photo-1556740758-90de377a67cc"),
    tags: ["gst", "freelancers", "business", "india"],
    content: article(
      "Freelancers and sole proprietors often ignore GST until a client demands a GSTIN. Understanding thresholds, invoice fields, and record-keeping early saves pain.",
      [
        {
          h: "Know whether you need to register",
          p: "Registration depends on turnover, supply type, and current rules — including special cases. Do not guess from WhatsApp forwards. Check the GST portal guidance or a CA for your situation.",
        },
        {
          h: "Invoicing hygiene",
          p: "If registered, invoices need required fields and correct tax treatment. Separate personal and business accounts. Keep contract copies and payment proofs.",
        },
        {
          h: "Tools vs compliance",
          p: "Online GST calculators help estimate tax on a bill; they do not file returns. Missing filing deadlines creates notices. Calendar your compliance dates.",
          bullets: [
            "Ask clients whether they need GST invoices before pricing",
            "Track expenses eligible as business costs with advice",
            "Avoid casual “cash only” habits that break audit trails",
          ],
        },
      ],
      [
        {
          q: "Can a calculator replace a CA?",
          a: "No. Calculators educate; professionals handle registration, returns, and edge cases.",
        },
      ],
      "## Disclaimer\n\nEducational content, not GST advisory."
    ),
  },
  {
    slug: "resume-ats-india-tech-nontech",
    category: "career",
    title: "ATS-Friendly Resume Tips for India (Tech & Non-Tech)",
    excerpt:
      "Formatting, keywords, and proof that passes parsing — without turning your CV into keyword spam.",
    coverImage: img("photo-1586281380349-632531db7ed4"),
    tags: ["resume", "ats", "jobs", "india"],
    content: article(
      "Many Indian employers route applications through ATS software. Fancy tables and graphics can break parsing. Clarity wins.",
      [
        {
          h: "Format that machines and humans both read",
          p: "Use a clean single-column layout, standard section headings, and common fonts. Export a true text-based PDF. Avoid headers/footers for critical info, text boxes, and icons replacing words.",
        },
        {
          h: "Keywords without stuffing",
          p: "Mirror language from the job description where truthful. Put skills in a skills section and prove them in bullets. Fake keyword packing is easy to spot in interviews.",
        },
        {
          h: "Proof over adjectives",
          p: "“Led migration cutting month-end close by 2 days” beats “dynamic synergistic leader.” Keep to 1–2 pages early career; more only if experience justifies it.",
          bullets: [
            "File name: Name_Role_Year.pdf",
            "Matching LinkedIn basics",
            "Customised resume for target role families",
          ],
        },
      ],
      [
        {
          q: "Do I need a photo?",
          a: "Usually no for most private-sector India roles unless explicitly requested. Follow the industry norm.",
        },
      ],
      "## Key takeaway\n\nReadable, honest, quantified."
    ),
  },
  {
    slug: "internship-india-how-to-convert-ppo",
    category: "career",
    title: "Internships in India: How to Improve Your Chances of a PPO",
    excerpt:
      "Delivery, visibility, and feedback loops that help convert internships into pre-placement offers.",
    coverImage: img("photo-1523240795612-9a054b0db644"),
    tags: ["internship", "ppo", "students", "careers"],
    content: article(
      "A PPO is not only about brilliance — it is about reliable delivery and being easy to hire. Treat the internship like a 2–6 month interview.",
      [
        {
          h: "Week 1 foundations",
          p: "Clarify success metrics with your mentor. Set up tools, access, and a weekly update cadence. Ask what “great” looks like for conversion.",
        },
        {
          h: "Delivery habits",
          p: "Ship small increments, write short status notes, and document decisions. Volunteer for visible but scoped tasks. Avoid silent struggle — escalate blockers early.",
        },
        {
          h: "Relationships and feedback",
          p: "Request mid-point feedback formally. Improve one skill aggressively. Be kind to PMs, designers, and support staff — references matter.",
          bullets: [
            "Keep a brag doc of contributions",
            "Present a final demo with before/after impact",
            "Understand return timelines and hiring freezes realistically",
          ],
        },
      ],
      [
        {
          q: "What if the team has a hiring freeze?",
          a: "Still leave with strong references and a portfolio piece. Conversion is not fully in your control.",
        },
      ],
      "## Key takeaway\n\nReliable teammates get offers; mysterious geniuses get shrugged shoulders."
    ),
  },
  {
    slug: "password-manager-why-indian-users-need-one",
    category: "technology",
    title: "Why Indian Users Need a Password Manager (and How to Start)",
    excerpt:
      "Reuse habits, UPI-era risk, and a simple migration plan from browser-saved passwords.",
    coverImage: img("photo-1555949963-ff9fe0c870eb"),
    tags: ["passwords", "security", "privacy", "india"],
    content: article(
      "If you reuse one password across email, shopping, and streaming, a single breach can cascade. Password managers reduce that risk and make unique passwords practical.",
      [
        {
          h: "The India-specific urgency",
          p: "Phishing via WhatsApp and fake apps is common. Unique passwords + MFA limit damage when one site leaks. Banking apps still need their own vigilance — managers help the rest of your digital life.",
        },
        {
          h: "How to migrate without chaos",
          p: "Install a reputable manager, create a strong master password stored offline, enable MFA on the manager account, then change passwords on email and finance sites first. Update others as you log in.",
        },
        {
          h: "Family and sharing",
          p: "Use secure sharing features instead of texting passwords. For elders, set up together once and label entries clearly.",
          bullets: [
            "Never store master password only in the cloud notes without backup understanding",
            "Turn on breach alerts if available",
            "Still verify URLs before autofill",
          ],
        },
      ],
      [
        {
          q: "Are browser built-in managers enough?",
          a: "Better than reuse. Dedicated managers often sync across browsers/devices more cleanly — pick what you will actually use.",
        },
      ],
      "## Key takeaway\n\nUnique passwords are the habit; the manager is the tool."
    ),
  },
  {
    slug: "chatgpt-prompts-students-india-study-ethically",
    category: "ai",
    title: "ChatGPT for Indian Students: Ethical Study Prompts That Actually Help",
    excerpt:
      "Use AI to explain, quiz, and plan — without submitting unedited AI work as your own.",
    coverImage: img("photo-1509062522246-3755977927d7"),
    tags: ["chatgpt", "students", "education", "ai"],
    content: article(
      "AI can be a tutor for Indian students juggling boards, JEE/NEET adjacent prep, or college assignments. It becomes cheating when you submit untouched output as your thinking.",
      [
        {
          h: "High-value prompt patterns",
          p: "Ask for explanations at your level, analogies, step-by-step solutions you re-solve yourself, and quizzes. Example: “Explain photoelectric effect like I’m in Class 12, then give 5 MCQs with answers hidden.”",
        },
        {
          h: "What not to do",
          p: "Do not paste entire assignment PDFs for a finished submission if your institution forbids it. Do not invent citations. Verify maths and science facts against textbooks.",
        },
        {
          h: "Study system",
          p: "AI explain → closed-book recall → practice problems → spaced revision. Use AI for planning weekly schedules during exam season, including breaks.",
          bullets: [
            "Follow your college academic integrity policy",
            "Keep a mistake notebook AI cannot replace",
            "Use AI to generate practice, not confidence theatre",
          ],
        },
      ],
      [
        {
          q: "Will examiners detect AI writing?",
          a: "Tools and human readers both catch generic prose. More importantly, viva and numericals expose gaps.",
        },
      ],
      "## Key takeaway\n\nAI is a tutor, not a ghostwriter for your degree."
    ),
  },
  {
    slug: "digital-declutter-phone-storage-india",
    category: "productivity",
    title: "Digital Declutter for Indian Phones: Storage, Photos & WhatsApp",
    excerpt:
      "Free space and attention — WhatsApp media, downloads, and duplicate photos without losing what matters.",
    coverImage: img("photo-1512941937669-90a1b58e7e9c"),
    tags: ["productivity", "smartphone", "declutter", "whatsapp"],
    content: article(
      "Indian phones fill up with WhatsApp statuses, PDF question papers, and burst photos. Decluttering is less about aesthetics and more about performance and backup sanity.",
      [
        {
          h: "WhatsApp media diet",
          p: "Auto-download off on mobile data. Periodically clear cached media you do not need. Star important chats; export rare critical conversations. Exit noisy groups.",
        },
        {
          h: "Photos and downloads",
          p: "Backup favourites to Google Photos/iCloud intentionally, then delete local duplicates. Empty Downloads after sorting into labelled folders (IDs, bills, tickets).",
        },
        {
          h: "Monthly 20-minute ritual",
          p: "Uninstall unused apps, revoke odd permissions, clear large caches, and check cloud storage. Your future self booking a train ticket at 1% storage will thank you.",
          bullets: [
            "Keep a “Documents/IDs” album",
            "Do not delete tax proofs casually",
            "Restart phone after big cleanups",
          ],
        },
      ],
      [
        {
          q: "Should I use cleaner apps?",
          a: "Prefer built-in storage tools. Aggressive cleaner apps can be gimmicky or risky — read permissions carefully.",
        },
      ],
      "## Key takeaway\n\nLess clutter, fewer missed OTPs, faster phone."
    ),
  },
];
