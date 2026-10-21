/**
 * Hand-strengthen top priority thin blogs when Gemini quota is exhausted.
 * Inserts editorial depth before FAQ / Conclusion. Target ≥1200 words / 6 min.
 *
 *   npx tsx scripts/hand-strengthen-top.ts
 *   npx tsx scripts/hand-strengthen-top.ts --slug=buy-broadband-vs-5g-home-internet-india
 */
import { PrismaClient } from "@prisma/client";
import { wordCount } from "../lib/seo/article-quality";
import { readingTime } from "../lib/utils";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

const prisma = new PrismaClient();

type Patch = {
  slug: string;
  /** Markdown inserted immediately before ## FAQ or ## Conclusion */
  insertBeforeFaq: string;
  excerpt?: string;
  metaDescription?: string;
};

const PATCHES: Patch[] = [
  {
    slug: "bollywood-movies-worth-watching-this-month",
    excerpt:
      "A practical India playbook to stop wasting multiplex money and OTT hours on bad Bollywood films — trailer traps, director checks, theatre vs streaming math, and a weekly watchlist system.",
    metaDescription:
      "Stop wasting money on bad Bollywood movies. Evaluate trailers, directors, reviews, and theatre vs OTT so weekends actually deliver.",
    insertBeforeFaq: `## A simple weekly watchlist system that actually works

Treat movie picking like a short research task, not a late-night scroll. Once a week — Sunday night works for most people — spend fifteen minutes building a shortlist of three titles max. One theatrical candidate, one OTT film, one “maybe later” backup.

Write three filters on your Notes app:

1. **Creative check** — director + writer credits you recognise or can verify in two minutes.
2. **Format check** — does this need a big screen, or will a 55-inch TV with good audio be enough?
3. **Time check** — do you actually have a three-hour block, or should you pick a tighter 100–120 minute film?

If a title fails two of the three filters, drop it. Habit beats hype.

## Red flags that save money before you book

Skip a release (or wait for OTT) when you see several of these together:

- Trailer is only star poses, punchlines, and song teasers — no clear conflict.
- Early reviews from normal viewers keep mentioning a “dragged second half” or “forced climax”.
- The film is positioned as an “event” solely because of a festival weekend or celebrity PR.
- You are going only because friends already booked and FOMO is loud.

None of these prove a film is bad alone. Together, they are expensive signals.

## How to use CineVerse without drowning in posters

Start with a shortlist, then confirm legal streaming homes on official apps. Use CineVerse to browse and save titles, then cross-check runtime, language, and whether the story is theatrical-scale or living-room scale. Pair that with one trusted critic and a handful of recent audience notes — not a hundred rant comments.

The goal is not to become a film scholar. The goal is to stop paying ₹1,500 for a weekend you will forget by Monday.`,
  },
  {
    slug: "buy-broadband-vs-5g-home-internet-india",
    excerpt:
      "Fibre broadband vs 5G home internet in India: speed, latency, building wiring, peak-hour reality, and a step-by-step way to choose before locking an annual plan.",
    metaDescription:
      "Broadband vs 5G home internet in India — compare fibre stability, FWA latency, peak hours, and how to test before an annual plan.",
    insertBeforeFaq: `## Decision tree: pick in under ten minutes

Use this order — do not start with “who advertised 1 Gbps”:

1. **Can your building take fibre?** If FTTH is already live on your floor with a clean last-mile install, fibre wins for WFH, classes, and gaming nine times out of ten.
2. **Is copper/fibre messy or unavailable?** Then evaluate 5G FWA only if your phone shows strong mid-band 5G indoors at the router location during 8–10 pm.
3. **Is your usage mostly mobile hotspots already?** A proper 5G home router with an outdoor/window placement often beats a phone hotspot — but it is still wireless.

## What “100 Mbps” really means at home

ISP dashboards love download peaks. Your evenings care about:

- **Upload** for Zoom/Teams and cloud backups
- **Latency and jitter** for calls and games
- **Contention** when the whole society streams together

A stable 50–100 Mbps fibre with low jitter often feels better than a flashy 300 Mbps wireless link that dips when the cell is crowded. Run three tests: morning, afternoon, and prime-time evening — same device, same room.

## Costs Indians actually pay (beyond the brochure)

Compare total monthly cost, not just “plan price”:

- Router rent / deposit / one-time install
- Static IP or business add-ons you do not need
- OTT “free” bundles you already subscribe to
- Data fair-use caps on some FWA plans after a threshold

If you WFH, price one month of downtime risk too: missed meetings cost more than a ₹200 plan difference.

## Setup checklist before you sign annual

- Place the 5G indoor unit near a window facing the tower side; avoid metal cabinets.
- For fibre, insist on neat termination and note the ONT light behaviour when online support claims “all green”.
- Keep a 30-day exit option if the provider offers it; stress-test kids’ classes + your VPN + one 4K stream together.
- Write down peak-hour speedtest results with timestamps — useful if you need to escalate.

Educational guide only — plans and coverage change by city and society.`,
  },
  {
    slug: "linkedin-profile-india-job-seekers-2026-checklist",
    excerpt:
      "A 2026 LinkedIn checklist for Indian job seekers: headline formulas, quantified experience, keywords recruiters search, and a weekly outreach routine that gets replies.",
    metaDescription:
      "LinkedIn profile checklist for Indian job seekers in 2026 — headline, experience bullets, keywords, and recruiter-ready settings.",
    insertBeforeFaq: `## Headline formulas that get opened in India

Replace “Looking for opportunities | Hardworking” with role + proof + domain:

- \`Backend Engineer | Java, Spring, Kafka | Fintech payments\`
- \`Campus hire → SDE-1 | DSA + system design practice | Open to Bengaluru/Pune\`
- \`CA Finalist | FP&A internships | GST + MIS reporting\`

Recruiters search skills and cities more than soft adjectives. Put the searchable nouns first.

## Experience bullets that beat “Responsible for…”

Use: **action + scope + metric + tool**.

Weak: “Responsible for social media content.”  
Strong: “Grew Instagram reach 38% in 4 months for a D2C brand using Reels + UGC briefs (Canva, Meta Ads).”

If you lack big metrics, use volume or reliability: tickets closed per sprint, reports delivered weekly, uptime owned, students mentored, cities covered.

## Keywords and ATS without stuffing

Mirror the language of 5 job posts you actually want. Collect repeated skills (SQL, Salesforce, GST, React, Excel dashboards) and place them naturally in About + Experience + Skills. Do not paste a keyword block — algorithms and humans both bounce.

Turn on Open to Work for recruiters if you are actively searching. Keep location accurate (or “Bengaluru / Remote”) so you do not waste mutual time.

## Weekly 45-minute routine

1. **10 min** — update one project bullet with a fresh result.
2. **15 min** — comment thoughtfully on 3 posts from hiring managers in your field (not “Great share!”).
3. **20 min** — send 5 personalised connection notes referencing a specific post, product, or role — never a CV dump in the first message.

Consistency beats a one-time profile makeover. Track profile views and InMail for two weeks after changes so you know what worked.`,
  },
  {
    slug: "seo-checklist-new-websites-2026",
    excerpt:
      "Google Search Console playbook for new Indian websites in 2026: property setup, sitemap, indexing, Core Web Vitals, and a content cadence that avoids thin-page traps.",
    metaDescription:
      "SEO checklist for new websites: Search Console, sitemaps, indexing, CWV, and content depth so Google actually ranks you.",
    insertBeforeFaq: `## Week-one technical checklist (do this before “more blogs”)

1. **Domain property in Search Console** — covers www and non-www together.
2. **One canonical host** — pick apex or www and 301/308 the other; never split equity.
3. **XML sitemap submitted** — only indexable URLs; exclude search, filters, thin templates.
4. **robots.txt** — allow important hubs; do not accidentally Disallow CSS/JS Google needs.
5. **HTTPS everywhere** — mixed content and soft 404s waste crawl budget on new sites.

## Indexing reality for brand-new domains

“Discovered – currently not indexed” is common when pages are thin or poorly linked. Fix with:

- Unique titles and meta descriptions (no template spam)
- 800–1,200+ words of useful copy on money pages — or honest noindex until ready
- Internal links from homepage and category hubs
- Real outbound references only when they help the reader

Request indexing sparingly on your best URLs after they are actually good.

## Content cadence that AdSense and Google both respect

Publish fewer, deeper pages: one solid guide beats five 400-word stubs. Cluster topics (money tools, jobs explainers, India news context) and interlink them. Update dates when you refresh facts — stale “2024” titles on a 2026 site look abandoned.

Avoid doorway-style city×keyword matrices and scraped listings. They may get impressions briefly and then tank trust.

## Measure what matters in month one

In GSC, watch: Coverage, Core Web Vitals, and Queries with impressions but low CTR (title/meta rewrite targets). In Analytics, watch landing pages with high bounce and low time-on-page — those need depth or clearer intent match.

SEO is a system: crawl → index → rank → click → satisfy. Skip any step and traffic stays stuck.`,
  },
  {
    slug: "best-budget-laptops-students-india-2026",
    excerpt:
      "Best budget student laptops in India for 2026: RAM, SSD, CPU tiers, ₹45k–₹65k picks logic, student discounts, and what to skip so your machine lasts four years.",
    metaDescription:
      "Best budget laptops for Indian students — 16GB RAM, SSD, CPU advice, ₹45k–₹65k buying framework, and pitfalls to avoid.",
    insertBeforeFaq: `## Spec floor for a four-year degree (2026)

Treat these as minimums unless your college mandates something else:

- **RAM:** 16GB (8GB fills up with Chrome + IDE + Meet)
- **Storage:** 512GB NVMe SSD (256GB fills with datasets and offline lectures)
- **Display:** IPS, ≥300 nits if you sit near windows; 1080p is enough for most courses
- **Keyboard:** decent travel — you will type more than you game
- **Ports:** at least one USB-A + HDMI or a reliable USB-C hub budget

CPU: modern Intel Core i5 / Ryzen 5 class (or Apple M-series if you are in the Apple ecosystem and budget allows). Skip ultra-thin “fashion” lids that throttle under long compiles.

## Who should spend more — and who should not

Spend up if you do CAD, video editing, ML notebooks, or heavy design. Otherwise, put money into RAM + SSD + a solid warranty, not RGB and 144Hz screens you will never use in class.

Avoid grey-import “too cheap” listings without clear warranty channels in your city. A ₹3,000 saving is expensive if the board dies in semester two.

## Buying path that works in India

1. Shortlist 2–3 models that hit the spec floor.
2. Check student / card offers on Amazon, Flipkart, brand education stores, and campus stores.
3. Verify return window and onsite service pin codes for your hostel/home.
4. If possible, type on the keyboard in a Croma/Reliance Digital before ordering online.

## First-week setup checklist

- Update OS and firmware; turn on BitLocker/FileVault if available
- Create a college folder structure + cloud backup (Drive/OneDrive)
- Install only course tools first — bloatware slows cheap machines
- Keep the box and invoice for warranty and insurance claims

A boring, well-specced laptop beats a flashy underpowered one every single viva season.`,
  },
];

function injectBeforeFaq(content: string, block: string): string {
  if (content.includes(block.trim().slice(0, 40))) {
    return content; // already patched
  }
  const markers = ["\n## FAQ", "\n## Conclusion", "\n## Support creators"];
  let idx = -1;
  for (const m of markers) {
    const i = content.indexOf(m);
    if (i !== -1 && (idx === -1 || i < idx)) idx = i;
  }
  if (idx === -1) {
    return `${content.trim()}\n\n${block.trim()}\n`;
  }
  return `${content.slice(0, idx).trim()}\n\n${block.trim()}\n${content.slice(idx)}`;
}

function parseSlug(): string | null {
  const arg = process.argv.find((a) => a.startsWith("--slug="));
  return arg ? arg.split("=")[1] : null;
}

async function main() {
  const only = parseSlug();
  const list = only ? PATCHES.filter((p) => p.slug === only) : PATCHES;
  if (!list.length) {
    throw new Error(only ? `No patch for ${only}` : "No patches");
  }

  for (const patch of list) {
    const blog = await prisma.blog.findUnique({ where: { slug: patch.slug } });
    if (!blog) {
      console.error(`✗ missing ${patch.slug}`);
      continue;
    }
    const before = wordCount(blog.content);
    const next = injectBeforeFaq(blog.content, patch.insertBeforeFaq);
    const after = wordCount(next);
    const mins = readingTime(next);
    if (after <= before + 80) {
      console.log(`· ${patch.slug} already strengthened (${after}w)`);
      continue;
    }
    await prisma.blog.update({
      where: { id: blog.id },
      data: {
        content: next,
        readingTime: mins,
        ...(patch.excerpt ? { excerpt: patch.excerpt } : {}),
        ...(patch.metaDescription
          ? { metaDescription: patch.metaDescription }
          : {}),
      },
    });
    console.log(`✓ ${patch.slug}: ${before}w → ${after}w (${mins} min)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
