import { CATEGORIES } from "@/lib/data/categories";
import { slugify } from "@/lib/utils";

export type FullBlogPackage = {
  excerpt: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  content: string;
};

export const VALID_CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export function normalizeCategorySlug(raw: string | undefined, title: string): string {
  const slug = slugify(raw || "");
  if (VALID_CATEGORY_SLUGS.includes(slug)) return slug;
  return guessCategoryFromTitle(title);
}

export function guessCategoryFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (/cartoon|animation|anime|comic|meme|culture|viral/.test(t)) return "memes-culture";
  if (/movie|film|cinema|streaming|entertainment|show/.test(t)) return "movies";
  if (/game|gaming|esport/.test(t)) return "gaming";
  if (/ai|llm|gpt|agent|machine learning/.test(t)) return "ai";
  if (/code|program|developer|javascript|python/.test(t)) return "programming";
  if (/startup|founder|venture/.test(t)) return "startups";
  if (/money|finance|invest|stock|crypto/.test(t)) return "finance";
  if (/health|wellness|medical/.test(t)) return "health";
  if (/travel|trip|destination/.test(t)) return "travel";
  if (/market|brand|seo|growth/.test(t)) return "marketing";
  if (/career|job|hiring|resume/.test(t)) return "career";
  return "technology";
}

export function normalizeTags(raw: unknown, title: string, category: string): string[] {
  const fromAi = Array.isArray(raw)
    ? raw.map((t) => slugify(String(t))).filter(Boolean)
    : [];
  const fromTitle = title
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3)
    .slice(0, 3)
    .map((w) => slugify(w));
  return [...new Set([category, ...fromAi, ...fromTitle, "creators", "2026"])].slice(0, 5);
}

export function parseFullBlogJson(raw: string, title: string): FullBlogPackage | null {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    const data = JSON.parse(cleaned) as Partial<FullBlogPackage>;
    if (!data.content || typeof data.content !== "string") return null;
    const category = normalizeCategorySlug(data.category, title);
    const tags = normalizeTags(data.tags, title, category);
    const excerpt =
      (typeof data.excerpt === "string" ? data.excerpt : "").trim() ||
      data.content.split("\n\n").find((p) => p.trim() && !p.startsWith("#"))?.slice(0, 220) ||
      title;
    const metaTitle = (typeof data.metaTitle === "string" ? data.metaTitle : title).slice(0, 70);
    const metaDescription = (
      typeof data.metaDescription === "string" ? data.metaDescription : excerpt
    ).slice(0, 160);
    return {
      excerpt,
      category,
      tags,
      metaTitle,
      metaDescription,
      content: data.content.trim(),
    };
  } catch {
    return null;
  }
}

function section(title: string, paragraphs: string[], bullets?: string[]) {
  let md = `## ${title}\n\n${paragraphs.join("\n\n")}`;
  if (bullets?.length) {
    md += `\n\n${bullets.map((b) => `- ${b}`).join("\n")}`;
  }
  return md;
}

/** Rich offline blog when Gemini is unavailable — topic must match title/category. */
export function buildRichLocalFullBlog(title: string, categoryHint?: string): FullBlogPackage {
  const category = normalizeCategorySlug(categoryHint, title);
  const catName = CATEGORIES.find((c) => c.slug === category)?.name || "Technology";
  const topic = title.replace(/\.$/, "").trim();

  if (category === "movies" || /movie|film|ott|streaming|cinema|show/i.test(topic)) {
    return buildMoviesListicleFallback(topic, category, catName);
  }

  const content = [
    section("Introduction", [
      `${topic} is no longer a niche conversation—it is shaping how audiences discover, share, and pay for digital stories in 2026. Creators who understand this shift are building loyal communities faster than traditional media channels can adapt.`,
      `This article breaks down why the trend matters, what data and culture tell us, and how you can publish thoughtful work on ContentVerse that stands out in feeds without chasing empty hype.`,
    ]),
    section("Why this shift is happening now", [
      `Short-form platforms trained audiences to expect visual, emotional storytelling. Cartoon and stylized content lowers the barrier to entry: you do not need a studio budget to express a complex idea through character, color, and motion.`,
      `At the same time, recommendation algorithms reward watch time and rewatches. Serialized cartoon content—recurring characters, inside jokes, cliffhangers—naturally keeps people coming back. That loop benefits independent creators as much as legacy studios.`,
    ], [
      "Lower production cost vs live-action for many formats",
      "Strong shareability across Reels, Shorts, and static feeds",
      "Cross-generational appeal when tone is authentic",
      "Merch, community, and premium tiers scale with character IP",
    ]),
    section("What creators are doing differently", [
      `The best channels treat each post as one chapter in a larger world. They publish essays, behind-the-scenes notes, and polls that invite the audience into the creative process. Readers on ContentVerse respond to that transparency—it turns passive viewers into collaborators.`,
      `Successful teams also batch production: one writing day, one illustration pass, one export day. That rhythm prevents burnout and keeps quality consistent. If you are solo, start with a repeatable template—intro hook, three beats, one actionable takeaway.`,
      `Monetization is diversifying beyond ads. Paid newsletters, early-access episodes, and licensed assets (stickers, wallpapers, templates) let cartoon-first creators earn without diluting their voice.`,
    ]),
    section("Challenges worth planning for", [
      `Copyright and style mimicry remain real risks. Build original character sheets and document your influences. If you reference trending shows, add commentary and transformation—do not republish clips without rights.`,
      `Platform dependency is the other trap. Use ContentVerse as your owned home base: canonical posts, SEO-friendly excerpts, and tags that help new readers find you through search—not only algorithms.`,
    ], [
      "Protect original IP with clear visual bibles",
      "Publish long-form context posts alongside clips",
      "Track which topics drive saves vs shares",
      "Set a sustainable weekly publish cadence",
    ]),
    section("A practical playbook for your next post", [
      `Start with one sharp thesis tied to "${topic}". Open with a scene your reader recognizes—a late-night scroll, a group chat reaction, a childhood cartoon memory—then bridge to your argument in two sentences.`,
      `Support the thesis with one data point (even informal: a poll you ran, a comment pattern you noticed) and one quote from a creator or expert. End with a single action: draft an outline, sketch one frame, or publish a teaser paragraph on ContentVerse today.`,
    ]),
    section("Conclusion", [
      `${topic} is not a passing aesthetic—it is a durable format for digital entertainment because it combines emotion, identity, and replay value. The creators who win will pair bold visuals with honest writing and host their best work where they control the relationship with their audience.`,
      `Ship a draft, gather feedback in comments, and iterate in public. Your next post does not need to be perfect—it needs to be unmistakably yours.`,
    ]),
  ].join("\n\n");

  const excerpt = `${topic} is reshaping digital entertainment in 2026—here is why cartoon-first storytelling wins attention, community, and revenue (with a practical playbook for creators).`;

  const tags = normalizeTags(
    ["digital-entertainment", "creator-economy", catName.toLowerCase(), "storytelling"],
    title,
    category
  );

  const metaTitle = `${topic.slice(0, 55)} | ContentVerse`.slice(0, 70);
  const metaDescription = excerpt.slice(0, 160);

  return { excerpt, category, tags, metaTitle, metaDescription, content };
}

function buildMoviesListicleFallback(
  topic: string,
  category: string,
  catName: string
): FullBlogPackage {
  const content = [
    section("Introduction", [
      `${topic} — if that is what your family group chat has been debating, you are not alone. Indian OTT libraries refresh every month, and summer holidays are when everyone from kids to grandparents wants something worth finishing together.`,
      `This guide lists practical picks across Netflix, Disney+ Hotstar, Prime Video, and JioCinema. Availability shifts with licensing—confirm in your app before you plan snacks and blankets.`,
    ]),
    section("What makes a good family watch", [
      `The best shared watches balance energy and heart: clear storytelling, humour that lands across ages, and nothing that forces an awkward mid-movie exit. We leaned toward titles with strong word-of-mouth in India and rewatch value.`,
    ], [
      "Mix animation, Hindi cinema, and international hits",
      "Note age guidance where tone gets intense",
      "Prefer complete films over cliffhanger bait for one-night plans",
      "Keep one backup pick if your first choice left a platform",
    ]),
    section("Animated picks everyone can enjoy", [
      `Recent sequels and originals on Disney+ Hotstar and Netflix—think Pixar-level emotion or light martial-arts comedy—work when you need a safe default. They carry younger viewers while giving adults craft and jokes worth catching on a second pass.`,
    ]),
    section("Hindi and Indian stories", [
      `Not every family night needs dubbing. Films like gentle comedies, inspiring biographical dramas, or comfort web-series episodes on Prime Video give you cultural context kids can relate to. Pair with subtitles if your group mixes languages.`,
    ]),
    section("International favourites on Indian OTT", [
      `Stunning animation, superhero multiverse spectacle, and fairy-tale musicals still dominate shared watchlists. Queue one spectacle title and one quieter pick so the room can vote after dinner.`,
    ]),
    section("How to plan a summer movie marathon", [
      `Rotate who chooses, prep snacks before hitting play, and track finished titles so you do not repeat the same film twice in a week. Bookmark options on CineVerse to see what newly landed on streaming each week.`,
    ], [
      "Set a simple age rule before horror or intense action",
      "Use subtitles to keep everyone following along",
      "Stop after one great film—marathon fatigue is real",
    ]),
    section("Conclusion", [
      `${topic} is really about time together—not perfect algorithms. Pick one title tonight, discuss it afterward, and save the rest for lazy afternoons and rainy evenings.`,
      `Streaming catalogues change; treat this list as a starting point and verify availability on your apps before the popcorn goes in the microwave.`,
    ]),
  ].join("\n\n");

  const excerpt = `Planning family screen time this summer? A practical OTT shortlist for Indian viewers—animation, Hindi picks, and crowd-pleasers across major streaming apps.`;
  const tags = normalizeTags(
    ["ott", "family-movies", "streaming-india", catName.toLowerCase()],
    topic,
    category
  );
  const metaTitle = `${topic.slice(0, 55)} | ContentVerse`.slice(0, 70);
  const metaDescription = excerpt.slice(0, 160);

  return { excerpt, category, tags, metaTitle, metaDescription, content };
}

export const FULL_BLOG_JSON_SCHEMA = {
  type: "object",
  properties: {
    excerpt: {
      type: "string",
      description: "2-3 sentence hook for the blog card, max 220 chars",
    },
    category: {
      type: "string",
      description: `One category slug from: ${VALID_CATEGORY_SLUGS.join(", ")}`,
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "Exactly 5 lowercase hyphenated URL tags",
    },
    metaTitle: {
      type: "string",
      description: "SEO title under 70 characters",
    },
    metaDescription: {
      type: "string",
      description: "SEO meta description under 160 characters",
    },
    content: {
      type: "string",
      description:
        "Full blog body in markdown. Use ## for section headings (no # H1). Include 6-8 sections, multiple paragraphs per section, bullet lists where useful. Target 1200-1600 words. Do not repeat the article title as heading.",
    },
  },
  required: ["excerpt", "category", "tags", "metaTitle", "metaDescription", "content"],
} as const;
