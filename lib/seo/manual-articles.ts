/** Hand-written SEO articles (no AI) — 2 per category minimum pool. */
export type ManualArticle = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  content: string;
};

const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=1600&auto=format&fit=crop`;

function body(
  intro: string,
  sections: { h: string; p: string }[],
  extra?: string
): string {
  const parts = [intro, ...sections.map((s) => `## ${s.h}\n\n${s.p}`)];
  if (extra) parts.push(extra);
  return parts.join("\n\n");
}

export const MANUAL_ARTICLES: ManualArticle[] = [
  // Technology
  {
    slug: "best-budget-laptops-students-india-2026",
    category: "technology",
    title: "Best Budget Laptops for Students in India (2026)",
    excerpt:
      "A practical buying guide for college students — specs that matter, brands that last, and what to skip.",
    coverImage: img("photo-1496181133206-282ce4d0e50e"),
    tags: ["laptops", "students", "india", "buying-guide"],
    content: body(
      "Buying a laptop in India on a student budget is confusing because every brand claims to be 'perfect for studies.' Here is a clear framework based on what actually matters for coding, design, and everyday college work.",
      [
        {
          h: "Minimum specs that still feel fast in 2026",
          p: "Look for 16GB RAM (8GB is tight for browsers + IDE), SSD storage (512GB ideal), and a recent Ryzen 5 or Intel i5. For programming students, prioritize RAM and SSD over a dedicated GPU unless you edit video or play heavy games.",
        },
        {
          h: "Brands with reliable service in India",
          p: "ASUS, Lenovo, and HP generally have wider service networks in tier-2 cities. Check warranty terms and accidental damage protection — hostel life is hard on keyboards.",
        },
        {
          h: "What students overspend on",
          p: "RGB keyboards, ultra-thin chassis, and overkill GPUs rarely help with assignments. A ₹45,000–₹65,000 machine with good thermals beats a flashy ₹80,000 laptop that throttles in summer.",
        },
      ],
      "## Quick checklist\n\n- 16GB RAM\n- 512GB SSD\n- 1080p IPS display\n- Backlit keyboard for late-night work\n- USB-C charging if you travel often"
    ),
  },
  {
    slug: "how-5g-changed-mobile-apps-india",
    category: "technology",
    title: "How 5G Changed Mobile Apps in India",
    excerpt:
      "Faster downloads are obvious — but 5G also reshaped live streaming, UPI at scale, and real-time collaboration apps.",
    coverImage: img("photo-1511707171634-5f897ff02aa9"),
    tags: ["5g", "mobile", "india", "apps"],
    content: body(
      "When 5G rolled out across Indian metros, most headlines focused on speed tests. The deeper shift is how product teams design for always-on connectivity and lower latency.",
      [
        {
          h: "Live video and sports streaming",
          p: "Cricket streams on Jio and Hotstar improved buffer stability in crowded stadium networks. Creators now upload reels in HD without waiting for Wi‑Fi — changing how regional content gets distributed.",
        },
        {
          h: "Fintech and instant verification",
          p: "KYC flows, video banking, and insurance onboarding became smoother because uploads and face-match APIs respond faster. That reduces drop-off in onboarding funnels.",
        },
        {
          h: "What developers should design for",
          p: "Assume intermittent 4G outside metros. Use adaptive bitrate, offline caches, and optimistic UI — 5G users expect speed, but millions still toggle between networks daily.",
        },
      ]
    ),
  },
  // AI
  {
    slug: "chatgpt-vs-gemini-for-indian-creators",
    category: "ai",
    title: "ChatGPT vs Gemini for Indian Creators: Honest Comparison",
    excerpt:
      "Which AI assistant fits Hindi-English workflows, research, and content drafting? A side-by-side for bloggers and founders.",
    coverImage: img("photo-1677442136019-21780ecad995"),
    tags: ["chatgpt", "gemini", "creators", "comparison"],
    content: body(
      "Indian creators often mix English with Hindi phrases, cite local examples, and need tools that understand context — not just grammar. Both ChatGPT and Gemini are useful, but for different jobs.",
      [
        {
          h: "When Gemini shines",
          p: "Google integration, long context windows, and strong performance on structured tasks (outlines, JSON, summaries). ContentVerse uses Gemini for article summaries — it handles mixed-language prompts well.",
        },
        {
          h: "When ChatGPT shines",
          p: "Conversational brainstorming, role-play for interview prep, and plugin ecosystems. Writers who iterate in chat often prefer its tone control for first drafts.",
        },
        {
          h: "Practical workflow",
          p: "Use AI for outlines and research, not publish-ready copy. Fact-check dates, stats, and legal claims — especially for finance and health topics.",
        },
      ]
    ),
  },
  {
    slug: "prompt-engineering-basics-hindi-english",
    category: "ai",
    title: "Prompt Engineering Basics for Hindi-English Workflows",
    excerpt:
      "Simple patterns to get better answers from LLMs when you think and write in Hinglish.",
    coverImage: img("photo-1620712943543-bcc4688e7485"),
    tags: ["prompts", "llm", "hinglish", "tutorial"],
    content: body(
      "You do not need a computer science degree to write better prompts. You need clarity about the task, audience, and output format.",
      [
        {
          h: "The ROLE + TASK + FORMAT pattern",
          p: "Example: 'You are a travel writer for Indian families. Write a 3-day Jaipur itinerary under ₹15,000. Output as bullet points with morning/afternoon/evening.' This beats vague prompts like 'write about Jaipur.'",
        },
        {
          h: "Specify language mix explicitly",
          p: "If you want simple English with Hindi place names, say so. Models otherwise default to American English or overly formal Hindi.",
        },
        {
          h: "Iterate with constraints",
          p: "Add word limits, banned phrases, and must-include sections. Each constraint narrows the output and reduces editing time.",
        },
      ]
    ),
  },
  // Programming
  {
    slug: "python-vs-javascript-which-learn-first-2026",
    category: "programming",
    title: "Python vs JavaScript: Which to Learn First in 2026?",
    excerpt:
      "Both are beginner-friendly — but your goal (web, data, automation) should pick the language, not hype.",
    coverImage: img("photo-1555066931-4365d14bab8c"),
    tags: ["python", "javascript", "beginners", "career"],
    content: body(
      "Beginners in India often ask which language gets them hired fastest. The honest answer: pick the path, then the language.",
      [
        {
          h: "Choose JavaScript if…",
          p: "You want to build websites, full-stack apps, or work in startups using React/Next.js. The browser runs JavaScript — instant visual feedback keeps motivation high.",
        },
        {
          h: "Choose Python if…",
          p: "You lean toward data analysis, automation, backend APIs, or AI tooling. Python reads like English and dominates data science courses in Indian universities.",
        },
        {
          h: "You can learn both",
          p: "Many developers start with one, then add the other within a year. Depth beats dabbling — ship two small projects in one language before switching.",
        },
      ]
    ),
  },
  {
    slug: "git-commands-every-developer-uses-daily",
    category: "programming",
    title: "Git Commands Every Developer Uses Daily",
    excerpt:
      "A no-fluff cheat sheet for branch workflow, fixes, and collaborating on real teams.",
    coverImage: img("photo-1556075798-1645d4b1d6c5"),
    tags: ["git", "github", "workflow", "developers"],
    content: body(
      "Git intimidates newcomers because tutorials dump 50 commands at once. In practice, most days use a small set.",
      [
        {
          h: "Daily essentials",
          p: "`git pull` to sync, `git checkout -b feature/name` for new work, `git add .` and `git commit -m \"clear message\"` to save, `git push -u origin branch` to share.",
        },
        {
          h: "When you mess up",
          p: "`git status` shows what changed. `git restore file` discards local edits. `git reset --soft HEAD~1` undoes last commit but keeps changes staged — useful before a PR.",
        },
        {
          h: "Team habits that matter",
          p: "Small commits, descriptive messages, and pulling main before push prevent merge hell. Never force-push to shared branches unless you enjoy apologizing in Slack.",
        },
      ]
    ),
  },
  // Business
  {
    slug: "how-small-shops-go-digital-india",
    category: "business",
    title: "How Small Shops Go Digital in India (Without Big Budgets)",
    excerpt:
      "UPI, WhatsApp catalogs, and Google Maps — a realistic playbook for local businesses.",
    coverImage: img("photo-1454165804606-c3d57bc86b40"),
    tags: ["small-business", "digital", "india", "retail"],
    content: body(
      "You do not need a fancy app to compete online. Thousands of Indian kirana and boutique owners grew sales with tools already on their phones.",
      [
        {
          h: "Step 1: Be discoverable",
          p: "Claim your Google Business profile, add photos, hours, and UPI QR. Most local searches end on Maps — if you are not listed, you do not exist.",
        },
        {
          h: "Step 2: WhatsApp as your storefront",
          p: "Catalog photos, price lists, and order confirmation via WhatsApp Business. Broadcast offers to saved customer lists — permission-based, not spam.",
        },
        {
          h: "Step 3: Track what sells",
          p: "A simple spreadsheet beats guessing. Note SKUs, margins, and repeat buyers. Digital is not marketing only — it is better inventory decisions.",
        },
      ]
    ),
  },
  {
    slug: "pricing-freelance-services-india-2026",
    category: "business",
    title: "Pricing Freelance Services in India: A 2026 Guide",
    excerpt:
      "Hourly vs project rates, GST thresholds, and how to raise prices without losing clients.",
    coverImage: img("photo-1556761175-5973dc0f32e7"),
    tags: ["freelancing", "pricing", "india", "business"],
    content: body(
      "Undercharging is the most common freelancer mistake in India — not lack of skill. Clients judge value by clarity and outcomes, not hours alone.",
      [
        {
          h: "Project pricing beats hourly for creative work",
          p: "Package deliverables: '5 Instagram reels + captions — ₹18,000.' Scope protects you from endless revisions.",
        },
        {
          h: "GST and invoicing basics",
          p: "Know when registration is required. Professional invoices with HSN/SAC codes build trust with company clients.",
        },
        {
          h: "Raising rates",
          p: "Increase for new clients first. Grandfather loyal clients with a timeline. Add a case study each quarter to justify premium positioning.",
        },
      ]
    ),
  },
  // Finance — add 2 more niche if category already has many; still unique slugs
  {
    slug: "rd-account-vs-fd-which-better-india",
    category: "finance",
    title: "Recurring Deposit vs Fixed Deposit: Which Is Better for You?",
    excerpt:
      "Safe savings options explained for salaried Indians — liquidity, returns, and tax angles.",
    coverImage: img("photo-1579621970563-ebec7560ff3e"),
    tags: ["rd", "fd", "savings", "india"],
    content: body(
      "RD and FD are boring — and that is their strength. They suit emergency funds and short goals better than chasing stock tips.",
      [
        {
          h: "Fixed Deposit (FD)",
          p: "Lump-sum locked for a term. Higher rates for longer tenure. Break prematurely with a penalty. Good for bonus or inheritance you will not touch for 1–3 years.",
        },
        {
          h: "Recurring Deposit (RD)",
          p: "Monthly installments discipline saving. Slightly lower effective yield but matches salary cycles. Ideal for festival expenses or annual insurance premiums.",
        },
        {
          h: "Tax and inflation reality",
          p: "Interest is taxable per your slab. Real returns after inflation may be small — use these for safety, not wealth building. Pair with equity SIPs for long horizons.",
        },
      ],
      "*Educational content only — not financial advice.*"
    ),
  },
  {
    slug: "upi-safety-tips-india-2026",
    category: "finance",
    title: "UPI Safety Tips Every Indian Should Follow in 2026",
    excerpt:
      "Scams evolve fast — here is how to protect your bank account while keeping UPI convenience.",
    coverImage: img("photo-1563013547-824ae1b704d3"),
    tags: ["upi", "security", "scams", "india"],
    content: body(
      "UPI made payments effortless. Fraudsters exploit that speed with fake collect requests and impersonation calls.",
      [
        {
          h: "Golden rules",
          p: "Never enter UPI PIN to receive money. PIN is only for sending. Reject unknown collect requests immediately.",
        },
        {
          h: "Phone call scams",
          p: "Banks never ask for OTP on calls. Hang up and call the official number on your card. 'KYC update' urgency is a red flag.",
        },
        {
          h: "App hygiene",
          p: "Enable app lock, disable SMS forwarding apps, and review linked accounts in your UPI app monthly.",
        },
      ]
    ),
  },
  // Startups
  {
    slug: "validate-startup-idea-without-building",
    category: "startups",
    title: "How to Validate a Startup Idea Without Building the Product",
    excerpt:
      "Landing pages, waitlists, and customer interviews — prove demand before you write code.",
    coverImage: img("photo-1664575599736-c5197c684128"),
    tags: ["validation", "mvp", "founders", "startups"],
    content: body(
      "Founders fall in love with solutions. Customers pay for problems solved. Validation closes that gap cheaply.",
      [
        {
          h: "Talk to 20 target users",
          p: "Ask about their last time they faced the problem — not hypotheticals. If they cannot remember, urgency is low.",
        },
        {
          h: "Smoke test with a landing page",
          p: "Explain the outcome, add email capture or pre-order deposit. Traffic from communities beats polished design.",
        },
        {
          h: "Concierge MVP",
          p: "Deliver the service manually behind the scenes. Learn operations before automating — Zapier beats a six-month build.",
        },
      ]
    ),
  },
  {
    slug: "pitch-deck-slides-indian-angels-expect",
    category: "startups",
    title: "Pitch Deck Slides Indian Angels Actually Expect",
    excerpt:
      "Problem, market, traction, team — what to include and what to cut for pre-seed meetings.",
    coverImage: img("photo-1552664730-d307ca884978"),
    tags: ["pitch-deck", "fundraising", "angels", "india"],
    content: body(
      "Indian angel networks see hundreds of decks quarterly. Clarity and early traction signal matter more than 3D product mockups.",
      [
        {
          h: "Must-have slides",
          p: "Problem (specific), solution demo, market size bottom-up, business model, traction metrics, team credentials, ask and use of funds.",
        },
        {
          h: "India-specific angles",
          p: "Unit economics at Indian price points, payment behaviour (UPI, COD), and regulatory moats if applicable.",
        },
        {
          h: "Common mistakes",
          p: "Vanity TAM slides, hiding co-founder splits, and no clear 18-month milestone plan.",
        },
      ]
    ),
  },
  // Health
  {
    slug: "morning-routine-desk-workers-india",
    category: "health",
    title: "10-Minute Morning Routine for Desk Workers in India",
    excerpt:
      "Hydration, sunlight, and mobility — small habits that reduce afternoon crashes.",
    coverImage: img("photo-1571019613454-1cb2f99b2d8b"),
    tags: ["health", "routine", "desk-job", "wellness"],
    content: body(
      "Long commutes and AC offices wreck energy. A short morning routine beats heroic gym plans you abandon by Wednesday.",
      [
        {
          h: "Wake-up basics",
          p: "Glass of water before coffee. Two minutes of daylight on balcony or window — helps circadian rhythm.",
        },
        {
          h: "Mobility micro-set",
          p: "Neck rolls, shoulder openers, hip flexor stretch — 5 minutes total. Prevents the 'frozen shoulder' arc many developers know.",
        },
        {
          h: "Breakfast that stabilizes blood sugar",
          p: "Protein + fibre (eggs, poha with peanuts, daliya). Skip sugary chai-only mornings that spike then crash.",
        },
      ],
      "*General wellness tips — consult a doctor for medical conditions.*"
    ),
  },
  {
    slug: "understanding-bmi-body-fat-simple-guide",
    category: "health",
    title: "Understanding BMI and Body Fat: A Simple Guide",
    excerpt:
      "What the numbers mean, where they fail, and better markers for Indian body types.",
    coverImage: img("photo-1505751172876-fa1923c5c528"),
    tags: ["bmi", "body-fat", "health", "fitness"],
    content: body(
      "BMI is a screening tool, not a verdict. It helps population studies but misses muscle mass and fat distribution.",
      [
        {
          h: "BMI categories",
          p: "Under 18.5 underweight, 18.5–22.9 normal for many Asian guidelines, 23+ overweight risk. WHO ranges differ — context matters.",
        },
        {
          h: "When BMI misleads",
          p: "Athletes with muscle read 'overweight.' Thin people with visceral fat may read 'normal.' Waist circumference adds signal.",
        },
        {
          h: "Actionable next steps",
          p: "Track energy, sleep, strength, and annual blood work. Numbers on a scale are one input — not your identity.",
        },
      ]
    ),
  },
  // Fitness
  {
    slug: "home-workout-no-gym-equipment",
    category: "fitness",
    title: "Home Workout Plan Without Gym Equipment",
    excerpt:
      "A 4-week bodyweight program for beginners — progressive and apartment-friendly.",
    coverImage: img("photo-1517836357463-d25dfeac3438"),
    tags: ["home-workout", "bodyweight", "beginners", "fitness"],
    content: body(
      "No gym membership? You can still build strength and stamina with consistency and progressive overload using bodyweight variants.",
      [
        {
          h: "Week 1–2 foundation",
          p: "Squats, incline push-ups, glute bridges, plank holds. 3 sessions/week, 30 minutes. Focus on form videos, not speed.",
        },
        {
          h: "Week 3–4 progression",
          p: "Lower incline push-ups, split squats, dead bug core work. Add reps before adding fancy exercises.",
        },
        {
          h: "Recovery and nutrition",
          p: "Sleep 7+ hours. Protein at each meal supports repair — dal, eggs, paneer, chicken, or supplements if needed.",
        },
      ]
    ),
  },
  {
    slug: "protein-intake-indian-vegetarians-guide",
    category: "fitness",
    title: "Protein Intake Guide for Indian Vegetarians",
    excerpt:
      "Hitting protein goals with dal, paneer, soy, and smart meal timing — without expensive powders.",
    coverImage: img("photo-1490645935967-10de8baacd69"),
    tags: ["protein", "vegetarian", "nutrition", "india"],
    content: body(
      "Vegetarian diets in India can be carb-heavy. Conscious protein choices support muscle, satiety, and recovery.",
      [
        {
          h: "Daily targets",
          p: "Rough guide: 1.2–1.6g per kg body weight if training. A 70kg person targets 85–110g protein — track once to learn portions.",
        },
        {
          h: "Affordable sources",
          p: "Chana, moong, rajma, paneer, curd, soy chunks, peanuts. Combine grains with legumes for complete amino profiles across the day.",
        },
        {
          h: "When supplements help",
          p: "Whey or plant protein fills gaps on busy days — food first, powder as backup.",
        },
      ]
    ),
  },
  // Gaming
  {
    slug: "best-mobile-games-india-right-now",
    category: "gaming",
    title: "Best Mobile Games in India Right Now",
    excerpt:
      "Battle royales, casual puzzlers, and indie gems that run well on mid-range phones.",
    coverImage: img("photo-1542751371-adc38448a05e"),
    tags: ["mobile-games", "gaming", "india", "reviews"],
    content: body(
      "Indian mobile gaming is massive — diverse tastes from BGMI clans to quick commute sessions. Here is what is worth your storage in 2026.",
      [
        {
          h: "Competitive multiplayer",
          p: "Battle royales and tactical shooters dominate esports scenes. Stable ping matters more than graphics — play on Wi‑Fi for ranked.",
        },
        {
          h: "Casual and social",
          p: "Party games and co-op titles fit family groups. Look for offline modes if your data plan is capped.",
        },
        {
          h: "Indie discoveries",
          p: "Smaller narrative games on Play Store reward story lovers. Check reviews for ad load — some free titles interrupt constantly.",
        },
      ]
    ),
  },
  {
    slug: "how-to-start-game-streaming-youtube-india",
    category: "gaming",
    title: "How to Start Streaming Games on YouTube in India",
    excerpt:
      "Gear on a budget, audio tips, and growing from zero viewers without buying fake subs.",
    coverImage: img("photo-1611162451917-44d7213e07aa"),
    tags: ["streaming", "youtube", "gaming", "creators"],
    content: body(
      "Streaming looks glamorous; it is mostly consistency and community building. Start lean, improve weekly.",
      [
        {
          h: "Minimum setup",
          p: "Mid-range phone or PC, decent mic (even a ₹2,000 USB mic), stable upload speed 5Mbps+. Face cam optional early on.",
        },
        {
          h: "Content angle",
          p: "Niche beats generic — 'BGMI clutch reviews in Hindi' beats 'gaming stream' in a crowded market.",
        },
        {
          h: "Growth reality",
          p: "Stream 3x/week, clip highlights to Shorts, engage chat. First 100 loyal viewers matter more than algorithm hacks.",
        },
      ]
    ),
  },
  // Movies
  {
    slug: "bollywood-movies-worth-watching-this-month",
    category: "movies",
    title: "Bollywood Movies Worth Watching This Month",
    excerpt:
      "Theatrical releases and OTT hidden gems — how to pick without spoiler Twitter.",
    coverImage: img("photo-1485846234645-a62644f84728"),
    tags: ["bollywood", "movies", "reviews", "ott"],
    content: body(
      "Too many trailers, too little time. A simple filter helps you pick weekend watches without regret.",
      [
        {
          h: "Check director and writer track record",
          p: "Strong writing survives weak marketing. Look up previous work on IMDb or Letterboxd — patterns repeat.",
        },
        {
          h: "Theatre vs OTT",
          p: "Spectacle and sound design justify theatres. Intimate dramas often land better on OTT with subtitles.",
        },
        {
          h: "Avoid hype traps",
          p: "Star cast alone does not guarantee script quality. Wait 48 hours for audience reviews if you hate walking out mid-film.",
        },
      ]
    ),
  },
  {
    slug: "how-to-judge-film-beyond-star-ratings",
    category: "movies",
    title: "How to Judge a Film Beyond Star Ratings",
    excerpt:
      "Cinematography, pacing, and intention — a viewer's framework for sharper takes.",
    coverImage: img("photo-1478720568477-152d9b164e26"),
    tags: ["film", "criticism", "movies", "culture"],
    content: body(
      "Aggregate ratings average opinions — they hide why a film works or fails. Train your eye with structured viewing.",
      [
        {
          h: "Ask what the film wants to do",
          p: "Comedy, provocation, comfort, spectacle — judge against intent, not against a different genre.",
        },
        {
          h: "Notice craft",
          p: "Editing rhythm in action scenes, sound design in horror, framing in dialogue — craft elevates average scripts.",
        },
        {
          h: "Write one paragraph reviews",
          p: "Forcing yourself to articulate a take builds taste faster than passive scrolling.",
        },
      ]
    ),
  },
  // Travel — 2 more unique (category already has SEO guides)
  {
    slug: "ladakh-road-trip-planning-guide-india",
    category: "travel",
    title: "Ladakh Road Trip Planning Guide for Indians",
    excerpt:
      "Permits, altitude, bikes vs cars, and the best months — practical Leh–Ladakh prep.",
    coverImage: img("photo-1626621341517-bbf3d9990a23"),
    tags: ["ladakh", "road-trip", "india", "travel"],
    content: body(
      "Ladakh is stunning and unforgiving. Good planning turns a stressful drive into the trip of a decade.",
      [
        {
          h: "Best season",
          p: "June–September for road access. Winters close many passes. Acclimatize in Leh 24–48 hours before higher passes.",
        },
        {
          h: "Bike vs car",
          p: "Bikes feel cinematic but exhaust you on long days. SUVs suit groups and luggage. Carry spare tubes, cash, and fuel plan — pumps are sparse.",
        },
        {
          h: "Health and permits",
          p: "Inner Line Permit for certain areas. Hydrate, sunscreen, and respect altitude headaches — descend if symptoms worsen.",
        },
      ]
    ),
  },
  {
    slug: "south-india-backpacking-route-14-days",
    category: "travel",
    title: "South India Backpacking Route: 14 Days on a Budget",
    excerpt:
      "Bangalore → Hampi → Goa → Kerala — trains, hostels, and food that will not empty your wallet.",
    coverImage: img("photo-1602216051446-39c65eeef257"),
    tags: ["south-india", "backpacking", "budget", "travel"],
    content: body(
      "South India rewards slow travel — temples, coastlines, and filter coffee between overnight trains.",
      [
        {
          h: "Sample route",
          p: "Days 1–3 Hampi boulders, 4–6 North Goa beaches, 7–9 Fort Kochi, 10–12 Munnar hills, 13–14 Bangalore exit.",
        },
        {
          h: "Transport hacks",
          p: "IRCTC in advance for popular routes. Overnight buses save hotel nights. Local buses in Kerala are scenic and cheap.",
        },
        {
          h: "Budget ballpark",
          p: "₹1,200–₹2,000/day hostel + food + local travel if you skip luxury stays — excluding long-distance trains.",
        },
      ]
    ),
  },
  // Lifestyle
  {
    slug: "minimalist-wardrobe-indian-weather",
    category: "lifestyle",
    title: "Minimalist Wardrobe for Indian Weather",
    excerpt:
      "Fewer pieces, more combinations — surviving heat, humidity, and sudden rain.",
    coverImage: img("photo-1494790108377-be9c29b29330"),
    tags: ["minimalism", "wardrobe", "lifestyle", "india"],
    content: body(
      "Capsule wardrobes are not just aesthetic — they reduce decision fatigue before work.",
      [
        {
          h: "Core neutrals",
          p: "White, navy, olive, beige tops; one dark denim; breathable trousers. Linen and cotton beat polyester in summer.",
        },
        {
          h: "Layer for AC",
          p: "Light jacket or shrug for offices that freeze while outside melts you.",
        },
        {
          h: "One statement piece",
          p: "A watch, scarf, or kurta for festivals — personality without a stuffed closet.",
        },
      ]
    ),
  },
  {
    slug: "digital-detox-weekend-practical-plan",
    category: "lifestyle",
    title: "Digital Detox Weekend: A Practical Plan",
    excerpt:
      "Not monk mode — realistic steps to reclaim attention without quitting your job.",
    coverImage: img("photo-1499750310107-5fef28a66643"),
    tags: ["digital-detox", "habits", "mindfulness", "lifestyle"],
    content: body(
      "Full phone bans fail. Structured breaks stick — especially when social and work blur on one device.",
      [
        {
          h: "Friday night reset",
          p: "Delete social apps from home screen (not account). Set autoresponder for non-urgent WhatsApp groups.",
        },
        {
          h: "Saturday activities",
          p: "Walk without podcasts, cook a meal from scratch, meet someone in person. Boredom is the point — it resets dopamine.",
        },
        {
          h: "Sunday re-entry",
          p: "Note what felt better. Reinstall apps with notification limits — not defaults.",
        },
      ]
    ),
  },
  // Fashion
  {
    slug: "ethnic-wear-styling-festive-season-india",
    category: "fashion",
    title: "Ethnic Wear Styling Tips for Festive Season in India",
    excerpt:
      "Kurta fits, fabric choices, and accessories that photograph well at family functions.",
    coverImage: img("photo-1483985988355-763728e1935b"),
    tags: ["ethnic-wear", "festive", "fashion", "india"],
    content: body(
      "Wedding season overload? A few styling rules keep you sharp without new outfits every weekend.",
      [
        {
          h: "Fit first",
          p: "Shoulder seams on point, kurta length at mid-thigh or knee per occasion. Tailoring ₹200 fixes cheap buys.",
        },
        {
          h: "Fabric for climate",
          p: "Cotton-silk blends breathe in crowded halls. Save heavy brocade for evening events.",
        },
        {
          h: "Repeat smartly",
          p: "Change dupatta, stole, or jewelry to remix the same kurta — sustainable and budget-friendly.",
        },
      ]
    ),
  },
  {
    slug: "sustainable-fashion-brands-india",
    category: "fashion",
    title: "Sustainable Fashion Brands in India Worth Knowing",
    excerpt:
      "Homegrown labels focusing on handloom, fair wages, and slower drops.",
    coverImage: img("photo-1445205170230-053b83016050"),
    tags: ["sustainable", "fashion", "india", "brands"],
    content: body(
      "Fast fashion is cheap upfront; quality pieces amortize over years and reduce landfill guilt.",
      [
        {
          h: "What to look for",
          p: "Transparent sourcing, natural dyes, repair programs, and size-inclusive fits — marketing 'eco' without proof is greenwashing.",
        },
        {
          h: "Shopping habits",
          p: "Cost-per-wear math: a ₹4,000 jacket worn 80 times beats a ₹800 tee that pills in a month.",
        },
        {
          h: "Care extends life",
          p: "Cold wash, air dry, mend buttons early. Fashion sustainability starts in your laundry routine.",
        },
      ]
    ),
  },
  // Productivity
  {
    slug: "pomodoro-technique-remote-workers",
    category: "productivity",
    title: "Pomodoro Technique for Remote Workers",
    excerpt:
      "25-minute focus blocks with breaks — adapted for calls, time zones, and Indian WFH chaos.",
    coverImage: img("photo-1484480974693-6ca0a78fb36b"),
    tags: ["pomodoro", "focus", "remote-work", "productivity"],
    content: body(
      "Remote work blends kitchen noise, Slack pings, and odd hours. Pomodoro adds rhythm without rigid corporate schedules.",
      [
        {
          h: "Basic cycle",
          p: "25 minutes deep work, 5 minute break, repeat four times, then 20–30 minute long break. Adjust to 45/10 if context switching is rare.",
        },
        {
          h: "Protect the block",
          p: "Phone in another room, Slack on pause, one task only. Multitasking is myth — you toggle and lose depth.",
        },
        {
          h: "When it fails",
          p: "Creative brainstorming and long meetings do not fit pomodoros. Use blocks for execution days, not strategy offsites.",
        },
      ]
    ),
  },
  {
    slug: "notion-vs-google-docs-personal-planning",
    category: "productivity",
    title: "Notion vs Google Docs for Personal Planning",
    excerpt:
      "Tasks, journals, and project notes — which tool fits solo creators and students?",
    coverImage: img("photo-1434030216411-0b793f4b4173"),
    tags: ["notion", "google-docs", "planning", "tools"],
    content: body(
      "Tool debates waste time if you never review your plans. Pick one system and visit it daily.",
      [
        {
          h: "Google Docs wins when…",
          p: "You want simplicity, offline mobile access, and sharing with collaborators who live in Gmail. Great for essay drafts and meeting notes.",
        },
        {
          h: "Notion wins when…",
          p: "You need databases — content calendars, reading lists, habit trackers linked in one workspace.",
        },
        {
          h: "Hybrid approach",
          p: "Draft in Docs, track pipeline in Notion. The best system is the one you open every morning.",
        },
      ]
    ),
  },
  // Education
  {
    slug: "prepare-upsc-while-working-full-time",
    category: "education",
    title: "How to Prepare for UPSC While Working Full-Time",
    excerpt:
      "Realistic hours, optional subject choice, and burnout prevention for working aspirants.",
    coverImage: img("photo-1503676260728-1c00da094a0b"),
    tags: ["upsc", "civil-services", "education", "india"],
    content: body(
      "Lakhs attempt UPSC annually; many are salaried professionals. Structure beats heroic 14-hour fantasies.",
      [
        {
          h: "Time budget",
          p: "2–3 focused hours daily beats inconsistent cramming. Mornings or commute audio for current affairs.",
        },
        {
          h: "Optional subject strategy",
          p: "Pick based on overlap with GS and genuine interest — not rumor 'scoring' subjects alone.",
        },
        {
          h: "Mental health",
          p: "Multi-year exams need friendships, exercise, and exit plans. Identity beyond 'aspirant' prevents collapse on failure.",
        },
      ]
    ),
  },
  {
    slug: "best-free-online-courses-indian-students",
    category: "education",
    title: "Best Free Online Courses for Indian Students (2026)",
    excerpt:
      "NPTEL, SWAYAM, YouTube depth — credible learning without ₹2 lakh coaching fees.",
    coverImage: img("photo-1523240795612-9a054b0db644"),
    tags: ["courses", "students", "free", "education"],
    content: body(
      "Quality education is increasingly free online; credentials still matter for hiring — pair learning with projects.",
      [
        {
          h: "Government platforms",
          p: "NPTEL and SWAYAM offer IIT/IISc lectures with certificates. Employers recognize discipline to finish them.",
        },
        {
          h: "Global MOOCs",
          p: "Audit Coursera/edX courses free; pay only if you need verified certificates for visa or HR.",
        },
        {
          h: "Project proof",
          p: "GitHub repos, blog writeups, or internships beat certificate collections. Show work.",
        },
      ]
    ),
  },
  // Marketing
  {
    slug: "instagram-reels-strategy-small-brands-india",
    category: "marketing",
    title: "Instagram Reels Strategy for Small Brands in India",
    excerpt:
      "Hooks, regional audio, and CTAs that convert views into DMs — not vanity likes.",
    coverImage: img("photo-1432888622747-4eb9a8efeb07"),
    tags: ["instagram", "reels", "marketing", "small-business"],
    content: body(
      "Reels level the field for local brands competing with big ad budgets — if you respect the format.",
      [
        {
          h: "First 2 seconds",
          p: "Show the problem or result immediately — '₹199 breakfast platter in Indore' beats logo intros.",
        },
        {
          h: "Audio trends",
          p: "Regional trending audio boosts discovery. Dub in Hindi/English subtitles for silent scrollers.",
        },
        {
          h: "CTA in caption",
          p: "WhatsApp link, Google Maps pin, or 'DM REEL for menu.' Measure DMs, not likes.",
        },
      ]
    ),
  },
  {
    slug: "email-marketing-basics-creators-india",
    category: "marketing",
    title: "Email Marketing Basics for Creators in India",
    excerpt:
      "Newsletters still outperform algorithms — build a list you own.",
    coverImage: img("photo-1563986768609-322da13575f3"),
    tags: ["email", "newsletter", "creators", "marketing"],
    content: body(
      "Social platforms change rules overnight. Email subscribers are an asset you control.",
      [
        {
          h: "Lead magnet",
          p: "Offer a checklist, template, or exclusive essay for signup. 'Subscribe for updates' converts poorly.",
        },
        {
          h: "Cadence",
          p: "Weekly or biweekly beats daily spam. One strong idea per email with one link.",
        },
        {
          h: "Compliance",
          p: "Clear unsubscribe, honest subject lines, and avoid buying lists — reputation is hard to rebuild.",
        },
      ]
    ),
  },
  // Sports
  {
    slug: "ipl-2026-what-fans-should-watch",
    category: "sports",
    title: "IPL 2026: What Fans Should Watch Beyond the Scorecard",
    excerpt:
      "Match-ups, young bowlers, and tactical shifts in the middle overs — a fan's viewing guide.",
    coverImage: img("photo-1531419140105-6e857e659f72"),
    tags: ["ipl", "cricket", "sports", "india"],
    content: body(
      "T20 is chess at 140 km/h. Watching structure makes cricket more fun than ball-by-ball anxiety alone.",
      [
        {
          h: "Powerplay plans",
          p: "Field restrictions reward aggressive openers — note who attacks vs who anchors.",
        },
        {
          h: "Death bowling matchups",
          p: "Yorkers, wide yorkers, and slower balls — track which bowlers hide poor lengths.",
        },
        {
          h: "Impact subs",
          p: "Substitution rules change team balance. Watch how captains use extra batters or bowlers late.",
        },
      ]
    ),
  },
  {
    slug: "marathon-training-beginners-india",
    category: "sports",
    title: "Marathon Training for Beginners in India",
    excerpt:
      "From 5K to half marathon — heat, hydration, and shoes that will not destroy your knees.",
    coverImage: img("photo-1461896836934-ffe607ba8211"),
    tags: ["running", "marathon", "fitness", "sports"],
    content: body(
      "City marathons in Mumbai, Delhi, and Bangalore attract first-timers every year. Respect the distance — it humbles everyone.",
      [
        {
          h: "12-week progression",
          p: "Build weekly mileage slowly — 10% increase rule. Mix easy runs, one long run, optional speed work.",
        },
        {
          h: "Heat management",
          p: "Train early morning, electrolytes on long runs, light coloured clothing.",
        },
        {
          h: "Shoes and recovery",
          p: "Gait analysis at running stores helps. Sleep and protein matter as much as weekend long runs.",
        },
      ]
    ),
  },
  // Relationships
  {
    slug: "long-distance-relationships-making-them-work",
    category: "relationships",
    title: "Long-Distance Relationships: Making Them Work",
    excerpt:
      "Communication rhythms, trust, and visit planning — without toxic surveillance.",
    coverImage: img("photo-1521120098171-d6dba8b8d4ad"),
    tags: ["relationships", "long-distance", "dating", "communication"],
    content: body(
      "Distance amplifies insecurity or trust — depending on habits you build early.",
      [
        {
          h: "Scheduled connection",
          p: "Predictable video calls beat random guilt trips about reply speed. Share calendars for busy weeks.",
        },
        {
          h: "Shared goals",
          p: "Know the plan — who moves, when, and financial steps. Ambiguity breeds resentment.",
        },
        {
          h: "Privacy boundaries",
          p: "Location sharing 24/7 is not intimacy. Trust includes space.",
        },
      ]
    ),
  },
  {
    slug: "setting-boundaries-with-family-as-adult",
    category: "relationships",
    title: "Setting Boundaries With Family as an Adult",
    excerpt:
      "Respectful nos on career, marriage, and money — Indian family edition.",
    coverImage: img("photo-1516589178581-6cd7833ae3b2"),
    tags: ["family", "boundaries", "relationships", "india"],
    content: body(
      "Love and pressure often arrive in the same sentence. Boundaries protect relationships long-term.",
      [
        {
          h: "Clear and calm scripts",
          p: "'I appreciate your concern. I will decide careers on my timeline.' Repeat without debating every festival.",
        },
        {
          h: "United front with partner",
          p: "Couples align privately before family gatherings — mixed signals invite interference.",
        },
        {
          h: "Exit strategies",
          p: "Short visits, hotel stays, or post-dinner walks when conversations heat up.",
        },
      ]
    ),
  },
  // Psychology
  {
    slug: "understanding-anxiety-signs-coping-tools",
    category: "psychology",
    title: "Understanding Anxiety: Signs and Coping Tools",
    excerpt:
      "Racing thoughts, sleep issues, and grounding techniques — when to seek professional help.",
    coverImage: img("photo-1582719188393-bb71ca45dbb9"),
    tags: ["anxiety", "mental-health", "psychology", "coping"],
    content: body(
      "Anxiety is common and treatable — not a character flaw. Naming it reduces shame and speeds support.",
      [
        {
          h: "Common signs",
          p: "Restlessness, muscle tension, irritability, avoidance of situations, stomach issues without medical cause.",
        },
        {
          h: "Grounding techniques",
          p: "5-4-3-2-1 senses exercise, slow breathing (4-7-8), short walks. These calm the nervous system in minutes.",
        },
        {
          h: "Professional support",
          p: "Therapy (CBT helps many) and psychiatrist evaluation for severe symptoms. Crisis helplines exist — use them.",
        },
      ],
      "*Educational — not a substitute for professional mental health care.*"
    ),
  },
  {
    slug: "how-habits-form-and-break-bad-ones",
    category: "psychology",
    title: "How Habits Form (and How to Break Bad Ones)",
    excerpt:
      "Cue, routine, reward — applied to doomscrolling, snacking, and procrastination.",
    coverImage: img("photo-1499203733215-cf7c4ef07edb"),
    tags: ["habits", "behavior", "psychology", "productivity"],
    content: body(
      "Habits are automatic loops, not willpower failures. Redesign cues and rewards instead of blaming yourself.",
      [
        {
          h: "The habit loop",
          p: "Cue triggers behavior, behavior delivers reward. Identify all three for habits you want to change.",
        },
        {
          h: "Replace, do not delete",
          p: "Swap evening scrolling with a audiobook walk — same cue (boredom), different routine.",
        },
        {
          h: "Environment design",
          p: "Phone charger outside bedroom, junk food off desk, gym bag by door. Friction shapes behaviour.",
        },
      ]
    ),
  },
  // Career
  {
    slug: "switch-careers-in-your-30s-india",
    category: "career",
    title: "How to Switch Careers in Your 30s in India",
    excerpt:
      "Transferable skills, bridge roles, and financial runway — a realistic transition map.",
    coverImage: img("photo-1521737711867-e3b97375f902"),
    tags: ["career-change", "jobs", "india", "skills"],
    content: body(
      "Career switches at 30+ are common in India's tech and services economy — plan finances before drama.",
      [
        {
          h: "Skill audit",
          p: "List capabilities (communication, Excel, client management) that cross industries. Reframe CV for outcomes, not titles.",
        },
        {
          h: "Bridge roles",
          p: "Move to adjacent function first — sales to product marketing — before leap to unrelated field.",
        },
        {
          h: "Runway",
          p: "6–12 months expenses saved reduces panic accepts. Side projects prove new field before quit.",
        },
      ]
    ),
  },
  {
    slug: "linkedin-profile-optimization-job-seekers-india",
    category: "career",
    title: "LinkedIn Profile Optimization for Job Seekers in India",
    excerpt:
      "Headline, featured section, and recruiter search keywords that actually get callbacks.",
    coverImage: img("photo-1454165804606-c3d57bc86b40"),
    tags: ["linkedin", "jobs", "resume", "career"],
    content: body(
      "Recruiters search keywords, not poetry. Your profile is SEO for hiring.",
      [
        {
          h: "Headline formula",
          p: "Role + specialty + outcome — 'Backend Engineer | Node.js & Postgres | Built payments for 2M users.'",
        },
        {
          h: "Featured work",
          p: "Pin case studies, GitHub, or blog posts. Proof beats buzzwords in 'About.'",
        },
        {
          h: "Activity",
          p: "Comment thoughtfully on industry posts weekly. Visibility compounds.",
        },
      ]
    ),
  },
  // Memes & Culture
  {
    slug: "why-memes-spread-faster-than-news",
    category: "memes-culture",
    title: "Why Memes Spread Faster Than News",
    excerpt:
      "Emotion, identity, and shareability — the psychology behind viral images.",
    coverImage: img("photo-1517511620798-cec17d428bc0"),
    tags: ["memes", "viral", "internet", "culture"],
    content: body(
      "News informs; memes signal tribe membership. That is why your uncle forwards WhatsApp jokes faster than fact-checks.",
      [
        {
          h: "Low friction format",
          p: "One image, inside joke, instant reaction. No paywall, no 800-word preamble.",
        },
        {
          h: "Emotional valence",
          p: "Humour, outrage, and nostalgia travel fastest. Neutral facts lag unless framed as scandal.",
        },
        {
          h: "For creators",
          p: "Meme literacy helps marketing — borrow formats, never punch down, stay original to avoid backlash.",
        },
      ]
    ),
  },
  {
    slug: "indian-social-media-trends-2026",
    category: "memes-culture",
    title: "Internet Trends That Defined Indian Social Media in 2026",
    excerpt:
      "Regional audio, cricket moments, and creator-driven news commentary — what shaped the feed.",
    coverImage: img("photo-1611162616305-c69b3fa7fa5f"),
    tags: ["social-media", "trends", "india", "culture"],
    content: body(
      "Indian internet culture is multilingual and platform-hopping — Reels today, X threads tomorrow, WhatsApp tomorrow night.",
      [
        {
          h: "Regional creators rise",
          p: "Bhojpuri, Tamil, and Bengali comedy accounts hit national brands' radar. Localization beats dubbed metro content.",
        },
        {
          h: "Sports as social glue",
          p: "Match memes spike in real time — brands that react quickly win; tone-deaf posts get ratioed.",
        },
        {
          h: "Commentary over headlines",
          p: "Creators who explain news with memes and context often outperform traditional pages for youth audiences.",
        },
      ]
    ),
  },
];

export const MOCK_BLOG_SLUGS = [
  "the-shipping-mindset-2026-creators",
  "designing-with-ai-agents-2026",
  "typescript-patterns-i-use-every-day",
  "from-idea-to-1m-arr-in-9-months",
  "the-aesthetic-engineer",
  "growth-loops-over-funnels",
  "the-internet-loneliness-loop",
  "after-hours-the-night-stack",
  "modern-money-the-2026-stack",
  "your-first-1000-true-readers",
  "the-7-day-product-sprint",
  "the-vibe-shift-in-tech-content",
  "india-test-transition-2026",
  "t20-vs-test-mindset-for-creators",
];
