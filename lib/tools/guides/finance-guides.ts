import type { ToolGuide } from "../tool-guide-types";

/** Money tools: loans, investments, tax, GST, currency, commodities. */
export const FINANCE_GUIDES: Partial<Record<string, ToolGuide>> = {
  "emi-calculator": {
    intro:
      "An EMI (Equated Monthly Instalment) is the fixed amount you pay your bank or NBFC every month until a loan is cleared. Each EMI has two parts: interest on the balance still owed, and a slice of the principal. This free EMI calculator tells you the monthly instalment, the total interest and the total amount you will pay for a home loan, car loan, personal loan or education loan — in a few seconds and before you sign anything.",
    sections: [
      {
        heading: "How to use the EMI calculator",
        paragraphs: [
          "Enter three numbers: the loan amount (principal), the annual interest rate and the tenure in months (the tool shows the approximate number of years next to it, so 240 months reads as about 20 years). The result shows your monthly EMI, the total interest over the life of the loan and the total repayment. Change any one input and the answer updates instantly, so you can test many combinations in a minute.",
          "Use the rate your lender actually quoted, not an advertised “starting from” rate. Banks price home loans on your credit score, income profile and the loan-to-value ratio, so the rate on your sanction letter is often higher than the headline number.",
        ],
        bullets: [
          "Loan amount: the amount you will borrow after your down payment, not the price of the asset",
          "Interest rate: annual percentage, reducing-balance basis (this is how banks quote home, car and personal loans)",
          "Tenure: total repayment period in months; longer tenure lowers the EMI but increases total interest",
        ],
      },
      {
        heading: "The formula behind every EMI",
        paragraphs: [
          "The standard reducing-balance formula is EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1). Here P is the principal, r is the monthly interest rate (annual rate ÷ 12 ÷ 100) and n is the number of monthly instalments. This calculator uses exactly that formula, so the figure matches what a bank’s repayment schedule shows for the same inputs.",
          "In the early years most of each EMI goes towards interest, because the outstanding balance is high. As the balance falls, more of every instalment reduces principal. That is why prepaying a loan in the first few years saves far more interest than prepaying near the end.",
        ],
      },
      {
        heading: "Tenure versus EMI: the trade-off",
        paragraphs: [
          "A long tenure feels comfortable because the EMI is small, but the interest cost grows quickly. On a ₹50 lakh loan at 8.5%, stretching the tenure from 20 to 30 years cuts the EMI by roughly ₹5,000 a month but adds about ₹34 lakh of extra interest. Try both tenures here before choosing.",
          "A practical rule: pick the shortest tenure whose EMI you can pay comfortably, then use bonuses or annual increments to prepay. Many lenders keep total EMIs (all loans together) under 40–50% of take-home income when they assess eligibility, and it is a sensible personal limit too.",
        ],
        bullets: [
          "Keep an emergency fund of 3–6 months of expenses before committing to a large EMI",
          "Check for processing fees, prepayment charges and insurance bundled into the loan",
          "Floating-rate loans: your EMI or tenure can change when the lender revises its rate",
        ],
      },
      {
        heading: "Common mistakes when estimating EMI",
        paragraphs: [
          "People often compare loans by the interest rate alone. Processing fees, legal and valuation charges, and mandatory insurance change the true cost. Always compare the total outflow, not just the rate.",
          "Another mistake is ignoring the pre-EMI period on an under-construction property. Until the full loan is disbursed you usually pay interest only on the amount released so far. Your regular EMI starts after the final disbursement, so budget for both phases.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — ₹25 lakh home loan at 8.5% for 20 years",
        body: "Monthly EMI comes to about ₹21,696. Over 240 months you repay roughly ₹52.07 lakh in total, of which about ₹27.07 lakh is interest. The interest is slightly more than the amount you borrowed — a good reason to prepay when you can.",
      },
      {
        title: "Example 2 — ₹8 lakh car loan at 10%: 3 years vs 5 years",
        body: "A 5-year tenure gives an EMI near ₹16,998 and total interest of about ₹2.20 lakh. A 3-year tenure raises the EMI to about ₹25,814 but cuts total interest to about ₹1.29 lakh. You save around ₹90,000 by choosing the shorter loan if the higher EMI fits your budget.",
      },
      {
        title: "Example 3 — ₹10 lakh personal loan at 9% for 10 years",
        body: "EMI is about ₹12,668 and total interest about ₹5.20 lakh. Personal loans are normally unsecured and priced higher than 9%, so run the same numbers again with your actual offer.",
      },
    ],
    relatedLinks: [
      { href: "/tools/sip-calculator", label: "SIP calculator" },
      { href: "/tools/fd-calculator", label: "FD calculator" },
      { href: "/tools/salary-tax-calculator", label: "Salary tax calculator" },
      { href: "/tools/ppf-calculator", label: "PPF calculator" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "What is an EMI and what does it include?",
        a: "EMI stands for Equated Monthly Instalment. It is a fixed monthly payment made up of interest on the outstanding balance and a portion of the principal. The split changes every month, but the total EMI stays the same for a fixed-rate loan.",
      },
      {
        q: "Does a lower EMI mean a cheaper loan?",
        a: "No. A lower EMI usually comes from a longer tenure, which increases the total interest you pay. Compare the total repayment amount, not just the monthly instalment.",
      },
      {
        q: "Why is most of my early EMI interest?",
        a: "Interest is charged on the outstanding balance, which is highest at the start. As you repay principal, the balance falls, so the interest part of each EMI shrinks and the principal part grows.",
      },
      {
        q: "How can I reduce the interest on my loan?",
        a: "Choose a shorter tenure, make part-prepayments early in the loan, negotiate a lower rate based on your credit score, or consider a balance transfer if another lender offers a meaningfully lower rate after fees.",
      },
      {
        q: "Does this calculator work for floating-rate loans?",
        a: "It calculates EMI at the single rate you enter. For floating-rate loans the real EMI or tenure changes whenever the lender’s benchmark changes, so treat the result as an estimate and recalculate after a rate revision.",
      },
    ],
    ymylKind: "finance",
  },

  "sip-calculator": {
    intro:
      "A SIP (Systematic Investment Plan) lets you invest a fixed amount in a mutual fund every month instead of putting in a lump sum. This SIP calculator estimates how much your monthly investment could grow to over time at an assumed annual return. It shows the amount you invested, the estimated gain and the projected maturity value — useful for goal planning such as a child’s education, a house down payment or retirement.",
    sections: [
      {
        heading: "How to use the SIP calculator",
        paragraphs: [
          "Enter the monthly amount you plan to invest, the annual return you expect and the number of years. The calculator compounds the return every month and treats each instalment as invested at the start of the month, which matches how most SIPs work.",
          "The expected return is an assumption, not a promise. Equity mutual funds have delivered double-digit returns over some long periods and negative returns over others. Try three scenarios — a cautious one (for example 8%), a moderate one (10–12%) and an optimistic one — and plan around the cautious case.",
        ],
        bullets: [
          "Monthly investment: the amount debited from your bank every month",
          "Expected annual return: your assumed long-term growth rate (not guaranteed)",
          "Time period: SIPs work best over 7–10 years or more because compounding needs time",
        ],
      },
      {
        heading: "How SIP returns are calculated",
        paragraphs: [
          "The future value of a SIP is FV = P × [((1 + i)^n − 1) ÷ i] × (1 + i), where P is the monthly instalment, i is the monthly rate (annual rate ÷ 12 ÷ 100) and n is the number of months. Each instalment earns returns for a different length of time, which is why early instalments matter more than late ones.",
          "Real mutual funds do not grow in a straight line. Returns come as changing NAVs, and exit loads, expense ratios and taxes reduce what you finally take home. This calculator shows a smooth projection so you can compare plans, not predict your exact balance.",
        ],
      },
      {
        heading: "Why starting early beats investing more later",
        paragraphs: [
          "Because returns compound, time in the market is often more powerful than the monthly amount. Investing ₹5,000 a month for 20 years at an assumed 12% builds a corpus close to ₹50 lakh from ₹12 lakh invested. Investing the same ₹5,000 for only 10 years gives about ₹11.6 lakh from ₹6 lakh. Doubling the time does far more than doubling the contribution.",
          "If you cannot raise your SIP today, consider a step-up: increase the monthly amount by 5–10% each year as your income grows. Even a small yearly increase noticeably changes the final corpus.",
        ],
        bullets: [
          "Match the investment to the goal horizon: equity for 7+ years, debt or hybrid for shorter goals",
          "Review the plan once a year instead of reacting to market news every week",
          "Check the fund’s expense ratio, category and risk level before you start",
        ],
      },
      {
        heading: "What this calculator does not include",
        paragraphs: [
          "It does not subtract capital-gains tax, exit load or fund expenses, and it does not adjust for inflation. A corpus of ₹50 lakh in 20 years will buy less than ₹50 lakh does today. When you set a goal, inflate the target cost first and then work backwards to the SIP amount.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — ₹5,000 a month for 10 years at 12%",
        body: "You invest ₹6,00,000 in total. The projected maturity value is about ₹11.62 lakh, so the estimated gain is about ₹5.62 lakh.",
      },
      {
        title: "Example 2 — ₹10,000 a month for 15 years at 12%",
        body: "Total invested is ₹18 lakh. The projected value is about ₹50.46 lakh, an estimated gain of roughly ₹32.46 lakh. This is the kind of corpus people target for a child’s higher education.",
      },
      {
        title: "Example 3 — the effect of a lower return",
        body: "Keep ₹5,000 a month for 10 years but assume 10% instead of 12%. The projected value falls to about ₹10.33 lakh. A two-point difference in return changes the result by more than ₹1.2 lakh, which is why you should plan with conservative assumptions.",
      },
    ],
    relatedLinks: [
      {
        href: "/guides/money/sip-calculator-india-beginners-guide",
        label: "SIP beginners guide",
      },
      { href: "/tools/fd-calculator", label: "FD calculator" },
      { href: "/guides/money/fd-vs-rd-india-guide", label: "FD vs RD guide" },
      { href: "/tools/ppf-calculator", label: "PPF calculator" },
      { href: "/guides/money/ppf-account-india-guide", label: "PPF account guide" },
      { href: "/tools/rd-calculator", label: "RD calculator" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Are SIP returns guaranteed?",
        a: "No. Mutual fund returns depend on market performance and can be negative in the short term. The return in this calculator is only an assumption that helps you compare scenarios.",
      },
      {
        q: "What return should I assume for equity SIPs?",
        a: "There is no fixed answer. Many planners use 10–12% for diversified equity over the long term and plan with a lower figure to stay safe. Avoid using a recent high-return year as your assumption.",
      },
      {
        q: "Is a SIP better than a lump sum?",
        a: "A SIP spreads your purchases across market ups and downs, which reduces the risk of investing everything at a peak. A lump sum can do better in a rising market but carries timing risk. The right choice depends on how your money arrives and your risk comfort.",
      },
      {
        q: "Can I stop or pause a SIP?",
        a: "Yes. Most mutual fund houses let you pause or cancel a SIP without a penalty, though exit load may apply when you redeem units. Check the scheme documents for the exact terms.",
      },
      {
        q: "Does this include tax and fund charges?",
        a: "No. The projection is before capital-gains tax, exit load and expense ratio. Your actual post-tax return will be lower than the figure shown.",
      },
    ],
    ymylKind: "finance",
  },

  "fd-calculator": {
    intro:
      "A Fixed Deposit (FD) lets you lock a lump sum with a bank or company for a fixed period at a fixed interest rate. This FD calculator shows the maturity amount and the interest you will earn, using quarterly compounding — the method most Indian banks use for cumulative deposits. Use it to compare offers between banks, choose a tenure and plan cash flows before you open a deposit.",
    sections: [
      {
        heading: "How to use the FD calculator",
        paragraphs: [
          "Enter the deposit amount, the annual interest rate offered and the tenure in years. The tool applies the compound-interest formula and shows the interest earned and the maturity value. Run the same amount at two or three different rates to see how a small rate difference changes the final sum.",
          "Use the rate printed in the bank’s current rate card for your exact tenure and category. Senior-citizen rates are usually 0.25–0.50 percentage points higher than regular rates, so enter the right one for the depositor.",
        ],
        bullets: [
          "Principal: the amount you deposit once at the start",
          "Rate: the annual rate quoted by the bank for your tenure",
          "Tenure: years until maturity; many banks also offer odd-day tenures",
        ],
      },
      {
        heading: "How FD interest is calculated",
        paragraphs: [
          "For a cumulative FD the maturity amount is A = P × (1 + r ÷ n)^(n × t), where r is the annual rate, n is the number of compounding periods per year and t is the time in years. Banks in India typically compound quarterly, so n = 4. The calculator uses this default.",
          "In a non-cumulative FD the bank pays interest out monthly, quarterly or yearly and your principal stays the same. That suits people who need regular income, but the total return is lower than a cumulative FD of the same rate, because the interest is not reinvested.",
        ],
      },
      {
        heading: "Taxes, TDS and premature withdrawal",
        paragraphs: [
          "FD interest is added to your income and taxed at your slab rate every year, even for a cumulative FD where you receive nothing until maturity. Banks deduct TDS when the interest in a financial year crosses the threshold set by the Income Tax Department. If your total income is below the taxable limit you can submit Form 15G or 15H to avoid TDS.",
          "Closing an FD early usually reduces the rate by around 0.5–1 percentage point and some banks charge a penalty. If you may need the money, split one large deposit into a few smaller FDs so you can break only what you need.",
        ],
        bullets: [
          "Compare the post-tax return, not only the headline rate",
          "DICGC insurance covers up to ₹5 lakh per depositor per bank (principal plus interest)",
          "Laddering FDs across tenures balances liquidity and returns",
        ],
      },
      {
        heading: "Choosing between FD and other options",
        paragraphs: [
          "FDs are simple and predictable, which is why they suit emergency funds and short-term goals. For goals beyond five years, inflation can erode returns, so many people mix FDs with equity or debt funds. Use this calculator alongside the SIP and PPF tools to compare options for the same goal.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — ₹1,00,000 at 7% for 5 years",
        body: "With quarterly compounding the FD grows to about ₹1,41,478. The interest earned is about ₹41,478, an effective gain of roughly 41% over five years.",
      },
      {
        title: "Example 2 — ₹5,00,000 at 7.1% for 3 years",
        body: "The maturity amount is about ₹6,17,538 and the interest is about ₹1,17,538. If you are in the 30% slab, roughly ₹36,000 of that interest could go to tax over the three years, so your real gain is lower.",
      },
      {
        title: "Example 3 — comparing two banks",
        body: "A bank offering 7.25% on a 3-year ₹10 lakh FD will pay a few thousand rupees more than one offering 7.0%. But if the higher-rate bank is a smaller institution, weigh safety and the ₹5 lakh insurance limit before moving the entire amount.",
      },
    ],
    relatedLinks: [
      { href: "/guides/money/fd-vs-rd-india-guide", label: "FD vs RD guide" },
      { href: "/tools/sip-calculator", label: "SIP calculator" },
      {
        href: "/guides/money/sip-calculator-india-beginners-guide",
        label: "SIP beginners guide",
      },
      { href: "/tools/ppf-calculator", label: "PPF calculator" },
      { href: "/guides/money/ppf-account-india-guide", label: "PPF account guide" },
      { href: "/tools/rd-calculator", label: "RD calculator" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Which compounding does this FD calculator use?",
        a: "Quarterly compounding, which is the standard for cumulative fixed deposits at most Indian banks. Your bank’s exact result can differ by a few rupees because of day-count rules and rounding.",
      },
      {
        q: "Is FD interest taxable?",
        a: "Yes. FD interest is taxed as income from other sources at your slab rate. TDS may be deducted by the bank once interest crosses the annual threshold, and you can claim credit for it when you file your return.",
      },
      {
        q: "Is my FD safe?",
        a: "Deposits in scheduled banks are insured by DICGC up to ₹5 lakh per depositor per bank, covering principal and interest together. Amounts above that depend on the bank’s financial health.",
      },
      {
        q: "What is the difference between cumulative and non-cumulative FD?",
        a: "In a cumulative FD interest is reinvested and paid with the principal at maturity. In a non-cumulative FD interest is paid out at regular intervals, so the principal does not grow.",
      },
      {
        q: "Can I withdraw an FD before maturity?",
        a: "Usually yes, but the bank may reduce the interest rate and charge a penalty. Check the premature withdrawal terms before you deposit.",
      },
    ],
    ymylKind: "finance",
  },

  "rd-calculator": {
    intro:
      "A Recurring Deposit (RD) lets you save a fixed amount every month for a set tenure and earn interest at a fixed rate, much like an FD paid in instalments. This RD calculator shows the maturity amount, total deposits and interest for any monthly amount, rate and tenure. It is built for people who prefer a disciplined, low-risk way to save for a goal such as a gadget, a vacation, school fees or an emergency buffer.",
    sections: [
      {
        heading: "How to use the RD calculator",
        paragraphs: [
          "Enter your monthly deposit, the annual interest rate and the tenure in months. The calculator treats each deposit as earning interest for the remaining months and adds them up, giving you the total deposited, the interest earned and the maturity value.",
          "Banks quote RD rates by tenure, usually 6 months to 10 years. Check the rate card of your bank or post office before you calculate, because the rate for 12 months can differ from the rate for 36 months.",
        ],
        bullets: [
          "Monthly deposit: a fixed amount paid on the same date every month",
          "Rate: annual interest rate for the selected tenure",
          "Tenure: number of months you will keep depositing",
        ],
      },
      {
        heading: "How RD interest works",
        paragraphs: [
          "Each monthly instalment earns interest only for the time it stays in the account. The first deposit earns for the entire tenure, the last deposit for just one month. Most banks compound RD interest quarterly; this calculator uses a monthly compounding approximation, so your bank’s statement can differ by a small amount.",
          "Because the total interest depends on how long each instalment stays, an RD earns less in total than an FD of the same total amount invested on day one. The benefit of an RD is habit and convenience, not higher return.",
        ],
      },
      {
        heading: "Rules to know before opening an RD",
        paragraphs: [
          "Missing instalments usually attracts a small penalty per ₹100 of delay, and repeated defaults can close the account. Choose an amount you can pay without stress and set up an auto-debit from your salary account.",
          "RD interest is taxable as income from other sources and TDS rules apply when your interest crosses the bank’s annual threshold. Post office RDs follow their own rate schedule that the government reviews every quarter.",
        ],
        bullets: [
          "Use auto-debit so you never miss a monthly date",
          "Compare bank, small-finance bank and post office rates for the same tenure",
          "Premature closure usually reduces the interest rate",
        ],
      },
      {
        heading: "RD, SIP or FD: which fits your goal?",
        paragraphs: [
          "An RD suits short, fixed-value goals of one to five years when you cannot afford market risk. For goals beyond five years a SIP in a diversified fund may deliver more, but with fluctuation. Use this calculator with the SIP and FD tools to see the trade-off in numbers.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — ₹5,000 a month for 36 months at 6.5%",
        body: "You deposit ₹1,80,000 in total. The maturity amount is about ₹1,99,232, so the interest earned is about ₹19,232.",
      },
      {
        title: "Example 2 — ₹2,000 a month for 24 months at 7%",
        body: "Total deposits are ₹48,000 and the maturity value is about ₹51,662, giving interest of about ₹3,662. A small RD like this is a convenient way to build an annual-insurance or school-fee fund.",
      },
    ],
    relatedLinks: [
      { href: "/tools/fd-calculator", label: "FD calculator" },
      { href: "/tools/sip-calculator", label: "SIP calculator" },
      { href: "/tools/ppf-calculator", label: "PPF calculator" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "What happens if I miss an RD instalment?",
        a: "Most banks charge a small penalty for each late instalment and may close the account if you miss several in a row. Setting up an auto-debit avoids this.",
      },
      {
        q: "Is RD interest taxable?",
        a: "Yes. The interest is taxed at your slab rate, and TDS may be deducted when the interest crosses the bank’s yearly limit.",
      },
      {
        q: "Can I take a loan against my RD?",
        a: "Many banks allow a loan of up to 80–90% of the deposited balance against an RD at a rate slightly above the deposit rate. The exact terms vary by bank.",
      },
      {
        q: "Is an RD better than a SIP?",
        a: "An RD gives a known return with low risk, while a SIP in equity funds can earn more over the long term but may fall in value. Choose based on your time horizon and risk tolerance.",
      },
    ],
    ymylKind: "finance",
  },

  "ppf-calculator": {
    intro:
      "The Public Provident Fund (PPF) is a government-backed long-term savings scheme with a 15-year lock-in, tax-free interest and a deduction on contributions under the old tax regime. This PPF calculator estimates your maturity value from a yearly deposit, an assumed interest rate and the number of years. It helps you plan retirement or long-term goals with a fully safe, tax-efficient option.",
    sections: [
      {
        heading: "How to use the PPF calculator",
        paragraphs: [
          "Enter the amount you will deposit each year, the current PPF interest rate and the number of years. The default rate in the tool matches the recent government rate, but the government reviews PPF rates every quarter, so check the latest announcement on the India Post or Ministry of Finance site.",
          "The scheme allows a minimum of ₹500 and a maximum of ₹1.5 lakh per financial year. You can deposit in a lump sum or in up to twelve instalments. Deposits made by the 5th of the month earn interest for that month, so timing affects the result by a small amount.",
        ],
        bullets: [
          "Yearly deposit: between ₹500 and ₹1,50,000 per financial year",
          "Rate: set quarterly by the government and compounded annually",
          "Years: 15 is the basic term; you can extend in blocks of 5 years",
        ],
      },
      {
        heading: "Why PPF is popular with Indian savers",
        paragraphs: [
          "PPF follows the EEE model: the contribution qualifies for a deduction under Section 80C in the old regime, the interest is tax-free, and the maturity amount is tax-free. The government guarantees the scheme, so there is no market risk. For conservative investors these features are hard to match.",
          "The trade-off is liquidity. Money is locked for 15 years, with partial withdrawals allowed from the seventh financial year and loans available between the third and sixth year. The interest rate can also move down over time because it is not fixed for the entire term.",
        ],
      },
      {
        heading: "How the maturity amount is calculated",
        paragraphs: [
          "This calculator compounds the balance once a year: each year it adds your deposit and then applies the annual rate. It is a clean estimate of the corpus. The real PPF computes interest monthly on the lowest balance between the 5th and month-end, then credits it at the end of the financial year, so the exact figure in your passbook can differ slightly.",
          "Because the rate can change every quarter, treat the result as a planning number. Recalculate whenever the government revises the rate.",
        ],
        bullets: [
          "One PPF account per person; joint accounts are not allowed",
          "Deposits above ₹1.5 lakh in a year earn no interest",
          "Account can be opened at a post office or at authorised banks",
        ],
      },
      {
        heading: "Extending PPF beyond 15 years",
        paragraphs: [
          "After 15 years you can close the account, keep it without further deposits and continue to earn interest, or extend it in blocks of five years with or without contributions. Many people extend with contributions to keep building a tax-free retirement fund.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — maximum deposit of ₹1,50,000 a year at 7.1% for 15 years",
        body: "You deposit ₹22.5 lakh in total. The estimated maturity value is about ₹40.68 lakh, so the tax-free interest is about ₹18.18 lakh.",
      },
      {
        title: "Example 2 — ₹50,000 a year at 7.1% for 15 years",
        body: "Total contribution is ₹7.5 lakh and the estimated maturity value is about ₹13.56 lakh, giving about ₹6.06 lakh of tax-free interest. A smaller yearly amount still builds a useful long-term corpus.",
      },
    ],
    relatedLinks: [
      { href: "/guides/money/ppf-account-india-guide", label: "PPF account guide" },
      { href: "/tools/sip-calculator", label: "SIP calculator" },
      {
        href: "/guides/money/sip-calculator-india-beginners-guide",
        label: "SIP beginners guide",
      },
      { href: "/tools/fd-calculator", label: "FD calculator" },
      { href: "/guides/money/fd-vs-rd-india-guide", label: "FD vs RD guide" },
      { href: "/tools/salary-tax-calculator", label: "Salary tax calculator" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "What is the PPF lock-in period?",
        a: "The basic lock-in is 15 financial years. Partial withdrawal is allowed from the seventh year, and you can extend the account in blocks of five years after maturity.",
      },
      {
        q: "Is PPF interest tax-free?",
        a: "Yes. Interest earned in a PPF account and the maturity amount are exempt from income tax. The Section 80C deduction on contributions is available only under the old tax regime.",
      },
      {
        q: "How often does the PPF interest rate change?",
        a: "The government announces the PPF rate every quarter. The rate applied to your balance can therefore change during the 15-year term.",
      },
      {
        q: "What is the maximum I can invest in PPF in a year?",
        a: "₹1,50,000 per financial year across all your contributions. Amounts above this limit do not earn interest.",
      },
      {
        q: "Why does my passbook balance differ from this estimate?",
        a: "The real PPF calculates interest monthly on the lowest balance between the 5th and the last day of the month and credits it annually. This tool uses a simpler yearly compounding, so small differences are normal.",
      },
    ],
    ymylKind: "finance",
  },

  "gst-calculator": {
    intro:
      "Goods and Services Tax (GST) is the indirect tax charged on most goods and services in India. This GST calculator adds GST to a base price or removes it from a GST-inclusive price, and splits the tax into CGST and SGST for the standard slabs of 5%, 12%, 18% and 28%. It is made for shop owners, freelancers, accountants and shoppers who want to check an invoice or price a product quickly.",
    sections: [
      {
        heading: "How to use the GST calculator",
        paragraphs: [
          "Choose whether the amount you enter is GST-exclusive (the price before tax) or GST-inclusive (the price that already contains tax), then pick the GST rate. The calculator displays the base amount, the GST amount, the final total and the CGST and SGST halves.",
          "If you are checking a bill, use “inclusive” mode and enter the total printed on the bill. The tool works out how much of that total is tax, so you can see whether the shop charged the correct rate.",
        ],
        bullets: [
          "Add GST: price × (1 + rate ÷ 100)",
          "Remove GST: price ÷ (1 + rate ÷ 100) gives the base price",
          "CGST and SGST are each half of the GST for sales within one state",
        ],
      },
      {
        heading: "CGST, SGST and IGST explained",
        paragraphs: [
          "When a seller and buyer are in the same state, GST is split equally into Central GST (CGST) and State GST (SGST). For example, 18% GST is 9% CGST plus 9% SGST. When the sale crosses state borders, the whole 18% is charged as Integrated GST (IGST). The total tax is the same; only the ledger it goes to differs.",
          "This calculator shows the CGST and SGST split. If you are billing another state, the full GST amount is your IGST.",
        ],
      },
      {
        heading: "Which GST rate applies?",
        paragraphs: [
          "GST rates depend on the type of goods or services and are set by the GST Council. Essential items often fall in lower slabs, many everyday goods and services fall in the 18% slab, and luxury or sin goods have higher rates. Rates and classifications are revised from time to time, so always confirm the rate for your product using its HSN or SAC code on the official GST portal.",
          "Use the slab that is printed on the supplier’s invoice. If you are unsure, ask for the HSN or SAC code and verify it before you charge a customer, since charging the wrong rate can lead to notices and interest.",
        ],
        bullets: [
          "Keep a record of HSN/SAC codes for your products and services",
          "Small businesses may be exempt below the registration threshold or may opt for the composition scheme",
          "Input tax credit is available only on valid tax invoices",
        ],
      },
      {
        heading: "Common GST mistakes",
        paragraphs: [
          "A frequent error is applying the percentage on the wrong base. If a price already includes 18% GST, multiplying by 0.18 gives the wrong tax; you must divide by 1.18 first. Another mistake is rounding each line item differently from the invoice total. Always check the rounding rule your invoicing software follows.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — adding 18% GST to ₹10,000",
        body: "GST is ₹1,800, split into ₹900 CGST and ₹900 SGST. The invoice total is ₹11,800.",
      },
      {
        title: "Example 2 — removing 18% GST from ₹11,800",
        body: "The base price is ₹11,800 ÷ 1.18 = ₹10,000. The GST contained in the price is ₹1,800.",
      },
      {
        title: "Example 3 — 5% GST on ₹50,000",
        body: "GST is ₹2,500 (₹1,250 CGST + ₹1,250 SGST), so the total payable is ₹52,500. For a GST-inclusive price of ₹1,050 at 5%, the base is ₹1,000 and the tax is ₹50.",
      },
    ],
    relatedLinks: [
      { href: "/tools/pan-gstin-checker", label: "PAN / GSTIN checker" },
      { href: "/tools/salary-tax-calculator", label: "Salary tax calculator" },
      { href: "/tools/emi-calculator", label: "EMI calculator" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "How do I calculate GST from a GST-inclusive price?",
        a: "Divide the inclusive price by (1 + GST rate ÷ 100) to get the base price, then subtract the base from the inclusive price to get the GST. For 18% GST on ₹11,800 the base is ₹10,000 and the GST is ₹1,800.",
      },
      {
        q: "What is the difference between CGST, SGST and IGST?",
        a: "CGST and SGST apply to sales within the same state and each equals half of the GST rate. IGST applies to sales between states and equals the full GST rate.",
      },
      {
        q: "Which GST slabs does this tool support?",
        a: "The common slabs of 5%, 12%, 18% and 28%, and you can also enter a custom rate. Check the official GST rate finder for the exact rate on your product or service.",
      },
      {
        q: "Can I claim input tax credit using this calculator?",
        a: "No. This tool only computes tax amounts. Input tax credit depends on valid invoices, returns filed and the conditions in the GST law, so consult your CA for specifics.",
      },
    ],
    ymylKind: "tax",
  },

  "salary-tax-calculator": {
    intro:
      "This salary and income tax calculator compares India’s new tax regime with the old regime for FY 2026–27 and shows your estimated annual tax, monthly TDS and in-hand salary. Enter your gross salary, deductions and, for the old regime, HRA and Section 80C details. The tool then tells you which regime leaves you with more money, so you can choose well when you submit your declaration to your employer.",
    sections: [
      {
        heading: "How to use the calculator",
        paragraphs: [
          "Start with your annual gross salary and any other taxable income such as interest. Select your age group, because the old regime has higher basic exemption limits for senior and super-senior citizens. To compare fairly, also fill in the old-regime items: basic salary, HRA received, rent paid, 80C, 80D and home-loan interest.",
          "The result shows both regimes side by side: taxable income, tax after the Section 87A rebate, surcharge, cess, the effective rate and the monthly tax. The tool then highlights the regime with the lower tax and the saving.",
        ],
        bullets: [
          "New regime: lower slab rates, ₹75,000 standard deduction, very few deductions",
          "Old regime: higher slab rates, ₹50,000 standard deduction, deductions such as 80C, 80D, HRA and home-loan interest",
          "Employee PF and professional tax reduce your take-home estimate but are not treated as deductions in the new regime",
        ],
      },
      {
        heading: "New regime slabs used by this tool",
        paragraphs: [
          "The new regime in the calculator uses these slabs on taxable income: up to ₹4 lakh nil; ₹4–8 lakh 5%; ₹8–12 lakh 10%; ₹12–16 lakh 15%; ₹16–20 lakh 20%; ₹20–24 lakh 25%; above ₹24 lakh 30%. A Section 87A rebate can bring the tax to zero for incomes up to the rebate limit, and surcharge and 4% cess are added on top where applicable.",
          "Because rebates and slabs are revised in the Union Budget, always cross-check with the Income Tax Department’s official calculator before filing.",
        ],
      },
      {
        heading: "When does the old regime still win?",
        paragraphs: [
          "The old regime can still be better for people who claim large deductions: HRA with high rent, a home loan with significant interest, full Section 80C and health insurance under 80D. With the new regime’s lower slabs, many taxpayers up to about ₹15–20 lakh now do better under the new regime, but the break-even depends on your deductions, so test your own numbers.",
          "The comparison can change from year to year. Re-run the calculator every April when you submit your investment declaration, and again if your salary or rent changes.",
        ],
        bullets: [
          "HRA exemption is the least of: HRA received, rent paid minus 10% of basic, and 50% (metro) or 40% (non-metro) of basic",
          "Section 80C limit is ₹1.5 lakh and includes PPF, ELSS, EPF and life insurance premium",
          "You can switch regimes each year if you are a salaried person without business income",
        ],
      },
      {
        heading: "From tax to take-home",
        paragraphs: [
          "Your in-hand salary is lower than gross salary by tax, employee PF and professional tax. The tool divides the annual tax by 12 to show the monthly TDS and subtracts PF and professional tax from the estimated monthly take-home. Your employer’s payslip may differ because of variable pay, reimbursements and the timing of TDS.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — ₹12 lakh gross salary",
        body: "Under the new regime the taxable income after the ₹75,000 standard deduction is ₹11.25 lakh and the Section 87A rebate brings the tax to nil. Under the old regime, with HRA, ₹1.5 lakh in 80C and ₹25,000 in 80D (assuming basic is 40% of gross and rent is 20%), tax is roughly ₹71,900. The new regime saves about ₹71,900 in this case.",
      },
      {
        title: "Example 2 — ₹18 lakh gross salary",
        body: "The new regime tax is about ₹1,50,800 including cess, or about ₹12,567 a month. The old regime with the same deductions comes to about ₹2,06,500. The new regime is better by roughly ₹55,700 here.",
      },
      {
        title: "Example 3 — ₹8 lakh gross salary",
        body: "Both regimes bring the final tax to nil after the rebate, so either is fine. Choose the regime that lets you keep or avoid investments you actually need.",
      },
    ],
    relatedLinks: [
      { href: "/tools/ppf-calculator", label: "PPF calculator" },
      { href: "/tools/gst-calculator", label: "GST calculator" },
      { href: "/tools/emi-calculator", label: "EMI calculator" },
      { href: "/tools/sip-calculator", label: "SIP calculator" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Which regime is the default for FY 2026–27?",
        a: "The new tax regime is the default. You can opt for the old regime if you prefer, and salaried taxpayers can switch every year while filing or by informing their employer.",
      },
      {
        q: "Is the standard deduction different in the two regimes?",
        a: "Yes. This calculator uses ₹75,000 for the new regime and ₹50,000 for the old regime for salaried taxpayers.",
      },
      {
        q: "How is monthly TDS estimated here?",
        a: "The tool divides your estimated annual tax by 12. Your employer may deduct unevenly because of bonuses, arrears or declarations submitted mid-year.",
      },
      {
        q: "Does the calculator include capital gains or business income?",
        a: "No. It focuses on salary and a simple “other income” amount. Capital gains, business income and special-rate income need separate computation.",
      },
      {
        q: "Can I rely on this for filing my return?",
        a: "Use it for planning only. Always confirm on the Income Tax e-filing portal or with a qualified CA before filing.",
      },
    ],
    ymylKind: "tax",
  },

  "currency-converter": {
    intro:
      "Use this currency converter to convert between the Indian rupee and major world currencies such as the US dollar, euro, pound, UAE dirham, Singapore dollar and Japanese yen. It uses mid-market exchange rates so you can estimate the cost of a trip, a tuition payment, a remittance or an international purchase. Treat it as a reference before you check the exact rate offered by your bank or forex provider.",
    sections: [
      {
        heading: "How to use the currency converter",
        paragraphs: [
          "Enter the amount, then choose the currency you have in the “From” list and the currency you want in the “To” list. The converted value appears with the rate used, so you can note it and compare it with a forex card or remittance quote. To see the reverse direction, simply switch the two selections.",
          "Exchange rates move through the day. The rate you see here is a reference rate; the final rate on a transaction depends on your bank, the payment method and the time you transact.",
        ],
        bullets: [
          "Pick the From and To currencies from the lists",
          "Switch the two selections to check the opposite direction",
          "Compare the mid-market rate with your provider’s rate to see the markup",
        ],
      },
      {
        heading: "Mid-market rate versus the rate you actually get",
        paragraphs: [
          "The mid-market rate is the midpoint between the buy and sell prices on the interbank market. Banks, forex counters and remittance apps usually add a margin of around 0.5% to 3% on top, plus fixed fees. If a provider advertises zero fees, check the rate itself, because the margin may be hidden inside it.",
          "To compare offers, convert a fixed amount, say ₹1,00,000, at the mid-market rate shown here and compare how many dollars each provider would deliver. The difference is the real cost of the transfer.",
        ],
      },
      {
        heading: "Tips for travellers and students",
        paragraphs: [
          "For travel, forex cards and international debit cards often give better rates than cash exchange at airports. For education payments or family remittances, compare a few authorised dealers because the rates and fees differ.",
          "Indian residents sending money abroad must follow the Liberalised Remittance Scheme rules, including the annual limit and tax collected at source (TCS) on certain remittances. Check the latest rules with your bank before sending large amounts.",
        ],
        bullets: [
          "Avoid dynamic currency conversion (paying in INR abroad); choose the local currency on card machines",
          "Check foreign transaction fees on your credit or debit card",
          "Keep a record of the purpose code and documents for large remittances",
        ],
      },
      {
        heading: "Why the rupee rate changes",
        paragraphs: [
          "The INR rate moves with global demand for the dollar, crude oil prices, foreign investment flows, interest-rate differences and RBI intervention. Large events such as central bank announcements can move rates within minutes, so check again right before you transact.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — planning a trip",
        body: "If the mid-market rate is about ₹84 per US dollar, a budget of $2,000 is roughly ₹1,68,000 before fees. If your forex card adds a 2% margin, plan for around ₹1,71,000 instead.",
      },
      {
        title: "Example 2 — comparing remittance quotes",
        body: "You want to send ₹2,00,000 abroad. Convert it here at the mid-market rate, then ask each provider how many units of the foreign currency the recipient will actually receive. Choose the provider that delivers the most after all fees.",
      },
    ],
    relatedLinks: [
      { href: "/tools/silver-rate", label: "Silver rate" },
      { href: "/tools/fuel-price", label: "Fuel price" },
      { href: "/tools/emi-calculator", label: "EMI calculator" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Are these the exact rates my bank will give?",
        a: "No. They are mid-market reference rates. Banks and forex providers add a margin and fees, so the rate you actually receive is usually slightly worse.",
      },
      {
        q: "How often are the rates updated?",
        a: "Rates are refreshed regularly from a public exchange-rate source, but they can still be a few minutes behind the live market.",
      },
      {
        q: "Which currency conversion is cheapest for travel?",
        a: "Forex cards and low-markup international cards are usually cheaper than airport cash exchange. Always pay in the local currency when a card machine offers a choice.",
      },
      {
        q: "Can I use this converter for crypto?",
        a: "No. It covers fiat currencies only.",
      },
    ],
    ymylKind: "finance",
  },

  "silver-rate": {
    intro:
      "Silver is bought as jewellery, coins, bars and as an industrial metal, and its price in India changes every day with global silver rates and the dollar–rupee exchange rate. This tool shows a spot-based estimate of the silver rate per gram, per 10 grams and per kilogram in India, and includes a weight calculator so you can estimate the value of silver you plan to buy or sell.",
    sections: [
      {
        heading: "How to use the silver rate tool",
        paragraphs: [
          "Check the per-gram, 10-gram and per-kg figures at the top, then enter a weight in grams in the weight calculator. The tool multiplies the weight by the current estimated rate and shows the approximate value. For a kilogram, enter 1000 grams.",
          "The figure is an estimate built from the international silver price and the USD/INR rate. It is meant as a quick reference. Your local jeweller’s price will be higher because it includes import duty effects, GST and making charges.",
        ],
        bullets: [
          "Rate per gram: useful for small purchases such as coins",
          "Rate per 10 grams: the unit many jewellers quote",
          "Rate per kg: the unit used for bars and wholesale deals",
        ],
      },
      {
        heading: "What decides the silver price in India",
        paragraphs: [
          "Three things drive the price: the international silver price quoted in US dollars per troy ounce, the USD/INR exchange rate, and Indian import duty and taxes. When the rupee weakens against the dollar, silver becomes more expensive in rupees even if the global price does not move.",
          "Silver is also an industrial metal used in solar panels, electronics and electric vehicles, so its price reacts to industrial demand as well as to investor interest. That makes it more volatile than gold.",
        ],
      },
      {
        heading: "Buying silver: purity, making charges and GST",
        paragraphs: [
          "Pure silver is 99.9% (999 fine). Jewellery is usually 92.5% sterling silver (925). Ask for a hallmark or a purity certificate, and check the weight on a calibrated scale. Making charges for jewellery can range from a few percent to well over 15% of the metal value, and GST is charged on both the metal and the making charges.",
          "For investment, silver coins and bars from reputed refiners carry lower making charges than ornaments, but the resale price may still be lower than the buy price. Compare the buy-back policy before you purchase.",
        ],
        bullets: [
          "Ask for the bill with weight, purity and making charges listed separately",
          "Compare at least two sellers before buying",
          "Silver ETFs are another way to invest without storing the metal",
        ],
      },
      {
        heading: "Estimate versus the rate at your jeweller",
        paragraphs: [
          "Use this tool to know roughly what the metal is worth and to check whether a quoted price is in a sensible range. If a shop’s price is much higher than the estimate plus reasonable making charges and GST, ask for a breakup.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — estimating the value of 250 g of silver",
        body: "If the estimated rate is ₹100 per gram, 250 g is worth about ₹25,000 at spot. A jeweller may add making charges and GST on top, so the final bill can be noticeably higher for ornaments.",
      },
      {
        title: "Example 2 — checking a 1 kg bar quote",
        body: "Multiply the per-gram estimate by 1,000 to get the metal value of a kilogram bar. If a seller quotes much higher, ask for the premium, GST and any packaging charge in writing.",
      },
    ],
    relatedLinks: [
      { href: "/goldverse", label: "GoldVerse — gold & silver hub" },
      { href: "/tools/currency-converter", label: "Currency converter" },
      { href: "/tools/gst-calculator", label: "GST calculator" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Is this the price my jeweller will charge?",
        a: "No. It is a spot-based India estimate. Jewellers add making charges, GST and their own margin, so the retail price is higher.",
      },
      {
        q: "Why does the silver rate change every day?",
        a: "It follows the global silver price and the USD/INR exchange rate, both of which move during the day.",
      },
      {
        q: "What is the difference between 999 and 925 silver?",
        a: "999 silver is 99.9% pure and common for coins and bars. 925 sterling silver has 92.5% silver mixed with other metals and is used for most jewellery because it is harder.",
      },
      {
        q: "Is silver a good investment?",
        a: "Silver is volatile and can swing widely. It can diversify a portfolio, but it is not guaranteed to rise. This tool is for information, not investment advice.",
      },
    ],
    ymylKind: "finance",
  },

  "fuel-price": {
    intro:
      "Petrol and diesel prices in India differ from city to city because state taxes, local levies and transport costs vary. This tool lets you check the latest petrol and diesel prices by city and state using public fuel price data, so you can plan trips, compare costs between neighbouring states and estimate your monthly fuel spend.",
    sections: [
      {
        heading: "How to use the fuel price tool",
        paragraphs: [
          "Type your city name, for example Mumbai, Delhi or Pune, into the search box to see the current retail price of petrol and diesel per litre. Search a second city to see where fuel is cheaper. The tool is useful before a long road trip, when you are choosing where to refuel along a route.",
          "Prices are updated from public data sources, usually once a day. Oil marketing companies can revise rates at any time, so confirm the price on the pump before filling a large amount.",
        ],
        bullets: [
          "Type the city name and search",
          "Compare petrol and diesel prices together, then search another city to compare",
          "Check again on the day of travel for the latest rate",
        ],
      },
      {
        heading: "Why fuel prices differ between cities",
        paragraphs: [
          "The base price of fuel is set by oil marketing companies according to crude oil costs and the exchange rate. On top of this come central excise duty, state VAT or sales tax, dealer commission and freight. State VAT rates differ widely, so a litre of petrol can cost several rupees more in one state than in a neighbouring one.",
          "Cities far from refineries may also pay higher freight, and some states add additional local cess. That is why border towns sometimes see people cross the state line to refuel.",
        ],
      },
      {
        heading: "Estimating your monthly fuel cost",
        paragraphs: [
          "Divide your monthly distance by your vehicle’s mileage to get litres used, then multiply by the price per litre. A car that gives 15 km per litre and travels 1,200 km a month uses 80 litres. At ₹100 per litre that is about ₹8,000 a month. Use this tool to get the local price and check how a price change affects your budget.",
          "Small habits help: keeping tyres at the recommended pressure, avoiding sudden acceleration and servicing the vehicle on time can improve mileage by a few percent. Over a year that saves a meaningful amount.",
        ],
        bullets: [
          "Mileage in city traffic is lower than the figure on the brochure",
          "Diesel prices usually differ from petrol; compare the full cost for your vehicle",
          "Fuel cards and UPI offers from some pumps give small discounts",
        ],
      },
      {
        heading: "Fuel price trend and what it means",
        paragraphs: [
          "When crude oil rises sharply, fuel prices tend to rise with a lag. When it falls, retail prices may stay flat because of taxes. Following the daily rate helps you decide when to fill up before a possible revision, though price changes in India are usually small and gradual.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — monthly petrol budget",
        body: "A hatchback that travels 1,000 km a month at 16 km/l uses about 62.5 litres. At ₹100 per litre the monthly fuel cost is about ₹6,250. If the price rises by ₹2, the cost goes up by about ₹125 a month.",
      },
      {
        title: "Example 2 — road trip across two states",
        body: "For a 600 km trip at 15 km/l you need 40 litres. If the price is ₹3 cheaper in the next state, filling up there can save about ₹120 on the same fuel.",
      },
    ],
    relatedLinks: [
      { href: "/tools/rto-finder", label: "RTO finder" },
      { href: "/tools/vehicle-plate-decoder", label: "Vehicle plate decoder" },
      { href: "/tools/currency-converter", label: "Currency converter" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "How often are petrol and diesel prices updated?",
        a: "Oil marketing companies can revise prices daily. This tool refreshes from public data regularly, but the price at the pump is the final word.",
      },
      {
        q: "Why is petrol cheaper in some states?",
        a: "State VAT or sales tax and local levies differ, so the same base price ends up costing different amounts in different states.",
      },
      {
        q: "Does the price include taxes?",
        a: "Yes. Retail prices include central excise duty, state VAT and dealer commission.",
      },
      {
        q: "Are CNG and electric charging prices shown?",
        a: "No. The tool covers petrol and diesel only.",
      },
    ],
    ymylKind: "general",
  },
};
