/**
 * Hand-strengthen remaining STRENGTHEN blogs (Gemini quota-safe).
 *   npx tsx scripts/hand-strengthen-remaining.ts
 */
import { PrismaClient } from "@prisma/client";
import { wordCount } from "../lib/seo/article-quality";
import { readingTime } from "../lib/utils";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();
const prisma = new PrismaClient();

const PATCHES: { slug: string; insertBeforeFaq: string }[] = [
  {
    slug: "cockroach-janta-party-decoding-indias-newest-exam-meme-sensation",
    insertBeforeFaq: `## Why exam leak memes explode in India

Competitive exams sit at the centre of family pressure, coaching fees, and scarce government jobs. When a paper leak or irregularity rumour spreads, humour becomes a pressure valve. Memes compress anger, satire, and solidarity into one shareable frame — faster than long explainers.

That does not mean every meme is accurate. Treat viral “party” names and logos as cultural commentary unless an official commission, court, or verified newsroom confirms facts.

## How to read the trend without spreading harm

- Check whether a claim names a specific exam, date, and authority — vagueness is a red flag.
- Prefer primary sources (commission notices, police FIRs summarised by reputable outlets) over anonymous forwards.
- Separate satire accounts from impersonation that could mislead applicants about dates or fees.

## What this says about youth politics online

Satirical “parties” and insect mascots are not ballot strategies; they are protest aesthetics. They travel because they are funny, low-effort to remix, and emotionally true for students who feel the system failed them. For creators, the durable angle is the underlying trust deficit — not the joke of the week.`,
  },
  {
    slug: "why-memes-spread-faster-than-news",
    insertBeforeFaq: `## The distribution math favouring memes

A 12-second reel needs less attention than a 900-word report. Platforms reward completion and shares; memes are built for both. Newsrooms still matter for verification, but discovery often starts in group chats where a screenshot beats a URL.

In India, WhatsApp, Instagram Reels, and YouTube Shorts compress the same joke across languages within hours. That speed is useful for awareness and dangerous for rumours.

## A reader’s filter when memes outrun facts

1. Ask: is this claiming a specific event, number, or accusation?
2. Search the claim in two independent outlets before forwarding.
3. If it involves exams, money, or health — pause harder.

## What publishers can learn

Explainers that acknowledge the meme, then add timeline + sources, often rank and retain better than scolding readers. Pair humour literacy with civic literacy — that is how ContentVerse India treats viral culture without becoming a rumour mill.`,
  },
  {
    slug: "abu-dhabi-visa-subsidy-how-indian-travelers-can-save-money",
    insertBeforeFaq: `## Who typically benefits (and who should double-check)

Subsidy or fee-waiver campaigns change by season, nationality, and booking channel. Indian travellers should verify:

- Whether the offer applies to tourist vs transit visas
- Validity window and blackout dates
- Whether airline + hotel packages are mandatory
- Official UAE / Abu Dhabi tourism or embassy pages — not random “agent WhatsApp rates”

## Cost stack beyond the visa fee

Even with a reduced visa charge, budget for:

- Travel insurance that covers medical emergencies
- Airport transfers and peak-season hotel taxes
- SIM / eSIM data and card foreign-transaction fees
- Buffer for itinerary changes if a connection fails

## Practical booking checklist

Screenshot the official offer terms before you pay. Prefer cards with travel protection when possible. Keep passport validity (usually 6+ months), return ticket proof, and hotel confirmations ready. This guide is educational — rules change; confirm on official portals before you travel.`,
  },
  {
    slug: "nmcs-one-nation-one-license-draft-what-it-means-for-indian-doctors",
    insertBeforeFaq: `## What “one nation, one license” is trying to solve

Doctors often face state-level registration friction when they move for residency, fellowships, or private practice. A unified framework aims to reduce paperwork duplication while keeping patient safety and disciplinary oversight intact. Draft rules are not final law — always read the latest NMC notification.

## Practical implications to watch

- How existing state registrations migrate
- Continuing professional development / CME requirements
- Disciplinary cross-state enforcement
- Telemedicine and multi-state practice clarity

## What doctors and hospitals should do now

Track official NMC circulars, not social summaries. Hospitals updating credentialing SOPs should wait for final text before rewriting contracts. Patients benefit when verification becomes clearer — but transitional confusion is normal for large regulatory shifts.

Educational overview only — not legal or career advice.`,
  },
  {
    slug: "patriotism-beyond-the-flag-10-meaningful-ways-to-contribute-to-india-dai",
    insertBeforeFaq: `## Turn intention into a weekly habit

Pick two actions you can repeat every week instead of ten you will abandon:

- Pay taxes honestly and keep records tidy
- Vote and help one first-time voter navigate registration
- Support one local business or artisan with a real purchase
- Volunteer two hours for literacy, blood donation, or disaster relief when called

## Digital citizenship counts

Report cyber fraud early, refuse to forward unverified communal rumours, and use RTI / grievance portals when services fail — calmly and with evidence. Public systems improve when citizens document failures instead of only ranting.

## Teach the next circle

Explain one civic process to a younger sibling or neighbour: how a scheme portal works, how to spot a fake job notice, how to read a municipal bill. Quiet competence scales farther than performative posts.`,
  },
  {
    slug: "bareilly-uttar-pradesh-complete-travel-guide-2026",
    insertBeforeFaq: `## Getting there and moving around

Bareilly connects well by rail on major UP corridors; check IRCTC for latest trains from Delhi, Lucknow, and other hubs. For local movement, autos and app cabs cover central areas — agree fares clearly for longer temple or market hops.

## Food and neighbourhood tips

Ask locals for current favourites rather than copying a five-year-old list. Street food is part of the charm; stick to busy stalls and carry ORS/electrolytes in peak summer. If you are travelling for the jhumka cultural trail, pair markets with one quieter heritage stop so the day is not only shopping.

## Respect and safety basics

Dress modestly at religious sites, keep valuables minimal in crowded bazaars, and save offline maps for patches of weak data. Confirm festival dates each year — crowds and transport change overnight.`,
  },
  {
    slug: "jhumka-gira-re-reel-trend-how-to-create-your-viral-instagram-video",
    insertBeforeFaq: `## A reel workflow that beats random posting

1. **Hook (0–1s):** face or prop in frame immediately — no long logo sting.
2. **Payoff (1–7s):** the joke, dance hit, or jhumka moment people came for.
3. **Loop bait:** end on a motion that restarts cleanly.

Film in good daylight, lock exposure, and keep text large for mute autoplay. Use original audio when the trend allows — algorithm familiarity helps discovery.

## India-specific reach tips

Mix Hindi/English captions for broader reach. Post when your audience is actually online (evenings/weekends for many metros). Collaborate with one local creator instead of buying fake views.

## Avoid shadowban traps

Do not use misleading “giveaway” text, scraped audio that violates rights, or engagement bait that breaks Instagram rules. Save analytics weekly: watch retention graphs, not only vanity likes.`,
  },
  {
    slug: "best-mobile-games-india-right-now",
    insertBeforeFaq: `## How to choose without filling storage

Filter by: offline mode, data use, competitive vs casual, and whether the game is free-to-play with aggressive monetisation. On mid-range Androids common in India, close background apps and keep 3–4 GB free before installing heavy titles.

## Network and payment reality

Wi-Fi for first downloads; mobile data for patches only when needed. Prefer Play Store / official iOS listings. If you buy currency, use trusted UPI/card flows inside the official store — never “cheap UC” Telegram sellers.

## Healthier play habits

Use Match timers, take eye breaks, and keep night charges off the bed. Esports dreams need practice plans; most players should treat ranked ladders as entertainment first.`,
  },
  {
    slug: "indias-gcc-talent-shortage-essential-skills-companies-want-in-2026",
    insertBeforeFaq: `## Skills GCCs keep shortlisting

Beyond pure coding: cloud cost awareness, security basics, stakeholder communication, and domain context (banking, retail, healthcare ops). Data roles need SQL fluency plus storytelling; cyber roles need hands-on labs, not only certificates.

## How candidates can signal readiness

- Ship a small public project or case study with metrics
- Learn the tools your target GCC already lists on job posts
- Practice system design / scenario interviews with India-timezone peers
- Keep LinkedIn and GitHub consistent with your resume

## What hiring managers still reject quickly

Keyword stuffing without depth, unexplained job hops, and zero evidence of production ownership. GCCs hire for reliability in global delivery — show that in bullets, not slogans.`,
  },
  {
    slug: "will-upi-remain-free-the-hidden-costs-behind-indias-payment-miracle",
    insertBeforeFaq: `## Where costs already hide today

Consumers often pay zero MDR on P2P and many P2M flows, but the ecosystem still funds fraud ops, bank reconciliation, and UPI apps. Merchants may see MDR or platform fees on some channels; banks fund rails through other products.

## What to watch in policy debates

Any change to interchange, MDR caps, or wallet/prepaid rules can shift behaviour. Read RBI / NPCI circular summaries from reputable explainers — not fear screenshots.

## Practical habits for users and small merchants

- Enable transaction alerts; review UPI mandates monthly
- Prefer verified merchant QR codes
- Keep a non-UPI backup (card/netbanking) for outages
- For business, track settlement timelines and chargeback processes

Educational content — not financial advice.`,
  },
  {
    slug: "password-manager-why-indian-users-need-one",
    insertBeforeFaq: `## India threat model in plain language

SIM-swap attempts, reused bank passwords, and OTP phishing are common. A password manager lets every bank, email, and shopping site get a unique high-entropy password while you remember one strong master password (plus device biometrics).

## Getting started without overwhelm

1. Install a reputable manager (built-in browser/OS options or a trusted third party).
2. Save new logins going forward for two weeks.
3. Rotate the 10 highest-risk accounts (email, banks, income tax, DigiLocker).
4. Turn on 2FA where available — authenticator apps beat SMS when possible.

## Family setup tip

Help parents with a shared emergency sheet for the master recovery path stored offline. Never type master passwords into random “support” chats.`,
  },
  {
    slug: "can-india-become-a-global-education-export-hub-opportunities-challenges",
    insertBeforeFaq: `## Opportunities that are already real

English-medium faculty, competitive exam coaching IP, EdTech distribution, and diaspora demand for India-linked credentials. Universities that fix student services and research output can attract more international learners — especially from neighbouring regions.

## Structural challenges to name honestly

Faculty shortages, uneven quality assurance, visa friction for outbound/inbound mobility, and global brand perception. Exporting education is not only marketing; it is outcomes, placements, and safe campuses.

## What policymakers and institutes can prioritise

Transparent rankings of learning outcomes, smoother credit transfer, industry-linked labs, and student grievance redressal that actually works. Hype without capacity damages the brand faster than silence.`,
  },
  {
    slug: "sebis-upcoming-ai-rules-what-kill-switch-controls-mean-for-traders",
    insertBeforeFaq: `## Why regulators talk about kill switches

Algorithmic trading can amplify errors in milliseconds. Kill-switch / kill-switch-like controls aim to halt runaway strategies when limits breach — protecting market integrity and retail investors who never opted into someone else’s bug.

## What active traders should operationalise

- Know your broker’s order throttles and panic-cancel tools
- Cap position sizes and daily loss limits before enabling algos
- Keep a human override path even for “fully automated” setups
- Read SEBI circulars and exchange notices — drafts evolve

## Retail takeaway

If you do not run algos, you still benefit when institutions must control them. Avoid tips groups selling “SEBI-approved AI bots” — approval language is often fake.

Educational only — not investment advice.`,
  },
  {
    slug: "zohos-no-wfh-stance-vs-remote-work-what-indian-professionals-need-to-kno",
    insertBeforeFaq: `## How to evaluate any RTO / hybrid policy

Ask for: core office days, exception process, relocation support, and whether performance metrics changed with the policy. “Culture” arguments cut both ways — measure delivery, not seat time alone.

## Career moves if policies clash with your life

- Negotiate documented hybrid for caregiving constraints
- Target teams/companies with explicit remote charters
- Build a commute cost + time spreadsheet before accepting
- Keep skills portable so one policy shift does not trap you

## Manager playbook

Clarify outcomes, meeting norms, and fairness between remote-capable and office-bound roles. Ambiguous rules create quiet quitting faster than a firm but transparent policy.`,
  },
  {
    slug: "mastering-microservices-communication-for-system-design-interviews",
    insertBeforeFaq: `## Patterns interviewers expect you to compare

- Synchronous HTTP/gRPC vs async messaging
- Idempotency keys for payments-like flows
- Circuit breakers, timeouts, and bulkheads
- Saga / outbox patterns for multi-service writes
- Schema evolution for events

Speak in trade-offs: latency, coupling, failure modes, and operational cost — not buzzword lists.

## India interview tip

Use examples from UPI-scale fan-out, e-commerce inventory, or ride-hail dispatch. Draw the sequence diagram, then attack it: duplicate messages, partial failures, poison queues.

## Practice drill

Explain one user action across three services with retries and a dead-letter path in under five minutes. Clarity beats exotic tech names.`,
  },
  {
    slug: "cost-optimized-system-design-strategies-for-cloud-native-architectures",
    insertBeforeFaq: `## Cost levers that matter in Indian startups

Right-size instances, use spot/preemptible where safe, cache aggressively, and push cold data to cheaper storage tiers. Observability without cardinality explosions saves both rupees and on-call pain.

## Design habits that prevent bill shock

- Budgets + alerts on day one
- Per-tenant cost attribution for SaaS
- Autoscale on real SLIs, not vanity CPU
- Question every cross-AZ chatty pattern

## Architecture review questions

What is the cost of the p99 path? What happens at 10× traffic? Which component can be async? If you cannot answer, the design is not production-ready for lean teams.`,
  },
  {
    slug: "indias-first-quantum-chip-foundry-what-qpiais-move-means-for-deeptech",
    insertBeforeFaq: `## Why a domestic foundry narrative matters

Quantum and deeptech supply chains are strategic. Local capability can shorten research loops for academia and startups, attract talent, and reduce pure import dependence — even if global leaders still set many benchmarks.

## Realistic timelines for readers

Chip-to-product cycles are long. Celebrate milestones without confusing a foundry announcement with consumer quantum laptops next year. Watch talent pipelines, IP partnerships, and pilot customers.

## What students and engineers can do

Build foundations in physics, cryogenics-adjacent engineering, control electronics, and classical error-correction software. Internships and open research beats waiting for hype cycles.`,
  },
  {
    slug: "goa-monsoon-travel-guide-india",
    insertBeforeFaq: `## Monsoon packing and health

Carry rain shell, quick-dry clothes, ORS, basic meds, and waterproof phone pouches. Leptospirosis risk rises with flooded areas — avoid wading through dirty water. Prefer cooked hot food when streets are waterlogged.

## Beach vs hinterland strategy

Rough seas can close swimming; shift to spice farms, waterfalls (with local advice), and indoor heritage. Confirm ferry and road status daily — landslides and waterlogging are seasonal realities.

## Booking flexibility

Choose lodgings with clear cancellation in peak rain weeks. Keep one buffer evening in your plan for weather delays instead of stacking tight activities.`,
  },
  {
    slug: "smartphone-privacy-settings-india-whatsapp-upi-apps",
    insertBeforeFaq: `## 20-minute lockdown checklist

- App permissions: revoke unused mic/camera/location
- WhatsApp: lock chats, limit group add privacy, review linked devices
- UPI apps: verify mirror notifications, revoke old mandates, lock app with biometrics
- Lock screen: shorter timeout; hide sensitive notification previews
- Brokers/SMS: turn off OTP auto-fill into untrusted apps where possible

## Scam patterns to refuse

Screen-sharing with “bank officers”, QR codes that pull money, APKs outside Play Store, and links that ask for full card + OTP together. Hang up and call the number on the reverse of your card / official bank app.

## Family share plan

Set parents’ devices with fewer sideloaded apps and clearer language about never sharing OTP — even with “you”.`,
  },
  {
    slug: "setting-boundaries-with-family-as-adult",
    insertBeforeFaq: `## Scripts that lower heat

Use calm, specific lines: “I can visit on Sunday for two hours, not overnight.” “I will share career updates monthly, not daily.” Avoid debating every relative’s opinion in a group setting — take one-on-one follow-ups.

## Boundaries that protect money and time

Decide UPI limits for family requests, festival budgets, and how much unpaid labour you can give. Put agreements in writing for shared EMIs or property discussions when stakes are high.

## When to get help

If control escalates to threats, isolation, or violence, involve trusted allies and professional / legal support. Cultural respect does not require enduring harm.`,
  },
  {
    slug: "best-monsoon-destinations-in-india-7-lesser-known-spots-to-explore",
    insertBeforeFaq: `## How to pick a monsoon destination safely

Prioritise places with reliable road updates, indoor backup plans, and lodging above known flood lines. Check IMD forecasts and local admin advisories the morning you travel.

## Packing and footwear

Grip shoes beat fashion sneakers on wet trails. Dry bags for electronics, sachets of ORS, and a compact first-aid kit matter more than extra outfits.

## Responsible travel

Do not force closed trails, litter waterfall spots, or ignore landslide diversions. Lesser-known does not mean unregulated — hire local guides where recommended and pay fairly.`,
  },
];

function injectBeforeFaq(content: string, block: string): string {
  if (content.includes(block.trim().slice(0, 48))) return content;
  const markers = ["\n## FAQ", "\n## Conclusion", "\n## Support creators"];
  let idx = -1;
  for (const m of markers) {
    const i = content.indexOf(m);
    if (i !== -1 && (idx === -1 || i < idx)) idx = i;
  }
  if (idx === -1) return `${content.trim()}\n\n${block.trim()}\n`;
  return `${content.slice(0, idx).trim()}\n\n${block.trim()}\n${content.slice(idx)}`;
}

async function main() {
  let ok = 0;
  for (const patch of PATCHES) {
    const blog = await prisma.blog.findUnique({ where: { slug: patch.slug } });
    if (!blog) {
      console.error(`✗ missing ${patch.slug}`);
      continue;
    }
    const before = wordCount(blog.content);
    const next = injectBeforeFaq(blog.content, patch.insertBeforeFaq);
    const after = wordCount(next);
    const mins = readingTime(next);
    if (after < 1200 || mins < 6) {
      console.warn(`! ${patch.slug} still short after patch (${after}w, ${mins}m) — writing anyway`);
    }
    if (after <= before + 50) {
      console.log(`· ${patch.slug} already patched (${after}w)`);
      continue;
    }
    await prisma.blog.update({
      where: { id: blog.id },
      data: { content: next, readingTime: mins },
    });
    console.log(`✓ ${patch.slug}: ${before}w → ${after}w (${mins} min)`);
    ok++;
  }
  console.log(`\nDone: ${ok} updated`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
