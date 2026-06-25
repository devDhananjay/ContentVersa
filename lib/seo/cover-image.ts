import { CATEGORIES } from "@/lib/data/categories";

const UNSPLASH_PARAMS = "w=1600&auto=format&fit=crop&q=80";

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?${UNSPLASH_PARAMS}`;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Themed Unsplash pools — each theme has visually distinct images. */
const THEME_POOLS: Record<string, string[]> = {
  health: [
    "photo-1576091160399-112ba8d25d1d",
    "photo-1579684385127-1ef15d508118",
    "photo-1559757142-8d58055f3272",
    "photo-1581056771100-24da4f558f1e",
  ],
  career: [
    "photo-1521737711867-e3b97375f902",
    "photo-1552664730-d307ca884978",
    "photo-1600880292203-757bb62b4baf",
    "photo-1507679799987-c73779587ccf",
  ],
  business: [
    "photo-1556761175-5973dc0f32e7",
    "photo-1460925895917-afdab827c52f",
    "photo-1454165804606-c3d57bc86b40",
    "photo-1559136555-9303baea8ebd",
  ],
  robotics: [
    "photo-1535378917022-2d7001f6ffc2",
    "photo-1485828742530-039875a3b7aa",
    "photo-1677756119517-28364c2f4f70",
    "photo-1558618666-fcd25c85cd64",
  ],
  code: [
    "photo-1504639725590-34d0984388bd",
    "photo-1555066931-4365d14bab8c",
    "photo-1461749280684-dccba630e2f0",
    "photo-1516116216624-53e697fedbea",
    "photo-1587620962725-abab7fe55159",
  ],
  data: [
    "photo-1551288049-bebda4e38f71",
    "photo-1624127458585-38cec0be38c5",
    "photo-1635070041078-e363dbe005cb",
    "photo-1677442136019-21780ecad995",
  ],
  cloud: [
    "photo-1544197150-b99a580bb7a8",
    "photo-1451187580459-43490279c0fa",
    "photo-1558494949-ef010cbdcc31",
  ],
  finance: [
    "photo-1611974789855-9c2a0a7236a3",
    "photo-1590283603385-17ffb3a7f29f",
    "photo-1579621970563-ebec7560ff3e",
    "photo-1642790106117-e829e14a801f",
  ],
  travel: [
    "photo-1506905925346-21bda4d32df4",
    "photo-1524492412937-280b9ca8c063",
    "photo-1477587458883-47145ed94245",
    "photo-1469854523086-cc02fe5d8800",
  ],
  food: [
    "photo-1490645935967-10de8baacd69",
    "photo-1504674900247-0877df9cc836",
    "photo-1546069901-ba9599a7e63c",
  ],
  fitness: [
    "photo-1517836357463-d25dfeac3438",
    "photo-1571019613454-1cb2f99b2d8b",
    "photo-1534438327276-14e5300c3a48",
  ],
  gaming: [
    "photo-1542751371-adc38448a05e",
    "photo-1611162451917-44d7213e07aa",
    "photo-1511512578047-dfb367046420",
  ],
  movies: [
    "photo-1485846234645-a62644f84728",
    "photo-1478720568477-152d9b164e26",
    "photo-1440404653325-ab127d49a1be",
    "photo-1536440136628-849c177e76a1",
    "photo-1574267432644-f610fd9f8380",
  ],
  sports: [
    "photo-1531419140105-6e857e659f72",
    "photo-1461896836934-ffe607ba8211",
    "photo-1574629810360-7efbbe195018",
    "photo-1517649763962-0c62306601b7",
  ],
  education: [
    "photo-1434030216411-0b793f4b4173",
    "photo-1503676260728-1c00da094a0b",
    "photo-1427504494785-3a9ca7044f45",
  ],
  fashion: [
    "photo-1483985988355-763728e1935b",
    "photo-1445205170230-053b83016050",
    "photo-1515886657613-9f3515b0c78f",
  ],
  lifestyle: [
    "photo-1499203733215-cf7c4ef07edb",
    "photo-1523240795612-9a054b0db644",
    "photo-1529156069898-49953e39b3ac",
  ],
  marketing: [
    "photo-1432888622747-4eb9a8efeb07",
    "photo-1557839473-10937981ce17",
    "photo-1460925895917-afdab827c52f",
  ],
  science: [
    "photo-1532094349884-543bc11b234d",
    "photo-1507413245164-616864d41ce9",
    "photo-1582719478250-c89cae4dc85b",
  ],
};

/** Score-based theme rules — first match wins by highest score, not first rule. */
const THEME_RULES: { theme: string; patterns: RegExp[] }[] = [
  {
    theme: "health",
    patterns: [
      /\bhealthcare\b/i,
      /\bmedical\b/i,
      /\bhospital\b/i,
      /\bdiagnostic/i,
      /\brural health\b/i,
      /\bdoctor\b/i,
      /\bpatient\b/i,
      /\bwellness clinic\b/i,
    ],
  },
  {
    theme: "movies",
    patterns: [
      /\bbollywood\b/i,
      /\bmaharaja\b/i,
      /\bbox office\b/i,
      /\bott\b/i,
      /\bbinge[\s-]?watch/i,
      /\bcinema\b/i,
      /\bfilm review\b/i,
      /\btheatre\b/i,
      /\bstreaming release/i,
    ],
  },
  {
    theme: "sports",
    patterns: [
      /\bipl\b/i,
      /\bcricket\b/i,
      /\bfootball\b/i,
      /\bsoccer\b/i,
      /\bhockey\b/i,
      /\bkabaddi\b/i,
      /\bbadminton\b/i,
      /\btennis\b/i,
      /\bolympics?\b/i,
      /\bworld cup\b/i,
      /\bpro kabaddi\b/i,
      /\bpkl\b/i,
      /\bisl\b/i,
      /\bformula\s*1\b/i,
      /\bf1\b/i,
      /\bmatch\b/i,
      /\btournament\b/i,
      /\bscorecard\b/i,
      /\bwicket\b/i,
      /\bbatsman\b/i,
      /\bbowler\b/i,
      /\bstadium\b/i,
      /\bmedal\b/i,
      /\bathlete\b/i,
    ],
  },
  {
    theme: "finance",
    patterns: [
      /\binvest/i,
      /\bsip\b/i,
      /\bmutual fund/i,
      /\bnifty\b/i,
      /\bstock\b/i,
      /\bportfolio\b/i,
      /\btax saving\b/i,
      /\b80c\b/i,
      /\bcredit card\b/i,
    ],
  },
  {
    theme: "travel",
    patterns: [
      /\btravel\b/i,
      /\bitinerary\b/i,
      /\bweekend getaway\b/i,
      /\btourist\b/i,
      /\bbackwaters\b/i,
      /\bhill station\b/i,
      /\bmanali\b/i,
      /\bgoa\b/i,
    ],
  },
  {
    theme: "food",
    patterns: [
      /\brecipe\b/i,
      /\bcooking\b/i,
      /\brestaurant\b/i,
      /\bstreet food\b/i,
      /\bkitchen\b/i,
    ],
  },
  {
    theme: "fitness",
    patterns: [
      /\bworkout\b/i,
      /\bgym\b/i,
      /\byoga\b/i,
      /\bprotein\b/i,
      /\bfitness\b/i,
      /\bbmi\b/i,
    ],
  },
  {
    theme: "gaming",
    patterns: [
      /\bgaming\b/i,
      /\besports\b/i,
      /\bgame stream/i,
      /\bmobile game/i,
      /\bplaystation\b/i,
    ],
  },
  {
    theme: "education",
    patterns: [
      /\bstudent/i,
      /\bexam\b/i,
      /\bupsc\b/i,
      /\blearning\b/i,
      /\bcourse\b/i,
      /\beducation\b/i,
      /\bstudy\b/i,
    ],
  },
  {
    theme: "career",
    patterns: [
      /\bcareer\b/i,
      /\bskills\b/i,
      /\bprofessional/i,
      /\bworkforce\b/i,
      /\bresume\b/i,
      /\blinkedin\b/i,
      /\bjob seek/i,
    ],
  },
  {
    theme: "business",
    patterns: [
      /\bsme\b/i,
      /\bsmall business/i,
      /\bstartup/i,
      /\bproductivity\b/i,
      /\bentrepreneur/i,
      /\bsales\b/i,
      /\bmonetize\b/i,
    ],
  },
  {
    theme: "cloud",
    patterns: [
      /\bdevops\b/i,
      /\bserverless\b/i,
      /\baws\b/i,
      /\blambda\b/i,
      /\bkubernetes\b/i,
      /\bcloud native\b/i,
      /\bmicroservices\b/i,
      /\bsystem design\b/i,
    ],
  },
  {
    theme: "code",
    patterns: [
      /\bprogramming\b/i,
      /\btypescript\b/i,
      /\bjavascript\b/i,
      /\bpython\b/i,
      /\bnext\.?js\b/i,
      /\breact\b/i,
      /\bgolang\b/i,
      /\bgo language\b/i,
      /\bdeveloper\b/i,
    ],
  },
  {
    theme: "robotics",
    patterns: [
      /\brobot/i,
      /\bcomputer vision\b/i,
      /\bimage recognition\b/i,
      /\bautonomous\b/i,
    ],
  },
  {
    theme: "data",
    patterns: [
      /\bllm\b/i,
      /\bgpt\b/i,
      /\bgemini\b/i,
      /\bbharatgpt\b/i,
      /\bgen ai\b/i,
      /\bgenerative ai\b/i,
      /\bneural\b/i,
      /\bmachine learning\b/i,
      /\bdata science\b/i,
      /\banalytics\b/i,
    ],
  },
  {
    theme: "marketing",
    patterns: [/\bseo\b/i, /\bmarketing\b/i, /\badsense\b/i, /\baffiliate\b/i],
  },
  {
    theme: "fashion",
    patterns: [
      /\bfashion\b/i,
      /\bwardrobe\b/i,
      /\bstyle\b/i,
      /\bethnic wear\b/i,
      /\boutfit\b/i,
    ],
  },
  {
    theme: "lifestyle",
    patterns: [
      /\bpomodoro\b/i,
      /\bhabit\b/i,
      /\brelationship\b/i,
      /\banxiety\b/i,
      /\bmeme\b/i,
      /\bsocial media trend/i,
    ],
  },
  {
    theme: "science",
    patterns: [/\bscience\b/i, /\bresearch\b/i, /\blaboratory\b/i],
  },
];

const CATEGORY_THEME: Record<string, string> = {
  ai: "data",
  technology: "code",
  programming: "code",
  finance: "finance",
  travel: "travel",
  food: "food",
  fitness: "fitness",
  gaming: "gaming",
  movies: "movies",
  sports: "sports",
  education: "education",
  fashion: "fashion",
  lifestyle: "lifestyle",
  marketing: "marketing",
  science: "science",
  health: "health",
  business: "business",
  startups: "business",
};

const CATEGORY_COVER_POOLS: Record<string, string[]> = {
  technology: dedupePhotos([
    "photo-1518770660439-4636190af475",
    "photo-1496181133206-282ce4d0e50e",
    ...THEME_POOLS.code!,
    ...THEME_POOLS.cloud!,
  ]),
  ai: dedupePhotos([
    ...THEME_POOLS.data!,
    ...THEME_POOLS.robotics!,
    ...THEME_POOLS.code!,
    "photo-1620712943543-bcc4688e7485",
    "photo-1526374965328-7f61d4dc18c5",
  ]),
  programming: dedupePhotos([...THEME_POOLS.code!]),
  business: dedupePhotos([...THEME_POOLS.business!]),
  finance: dedupePhotos([...THEME_POOLS.finance!]),
  startups: dedupePhotos([...THEME_POOLS.business!, "photo-1664575599736-c5197c684128"]),
  travel: dedupePhotos([...THEME_POOLS.travel!]),
  food: dedupePhotos([...THEME_POOLS.food!]),
  fitness: dedupePhotos([...THEME_POOLS.fitness!]),
  gaming: dedupePhotos([...THEME_POOLS.gaming!]),
  movies: dedupePhotos([...THEME_POOLS.movies!]),
  sports: dedupePhotos([...THEME_POOLS.sports!]),
  fashion: dedupePhotos([...THEME_POOLS.fashion!]),
  lifestyle: dedupePhotos([...THEME_POOLS.lifestyle!]),
  education: dedupePhotos([...THEME_POOLS.education!]),
  health: dedupePhotos([...THEME_POOLS.health!]),
  science: dedupePhotos([...THEME_POOLS.science!]),
  marketing: dedupePhotos([...THEME_POOLS.marketing!]),
};

const GLOBAL_POOL = dedupePhotos([
  ...Object.values(CATEGORY_COVER_POOLS).flat(),
  ...Object.values(THEME_POOLS).flat(),
]);

function dedupePhotos(ids: string[]): string[] {
  return [...new Set(ids)];
}

export type CoverImageInput = {
  categorySlug: string;
  title: string;
  excerpt?: string;
  tags?: string[];
  coverKeywords?: string[];
  slug?: string;
  uniqueKey?: string;
};

/** Best matching visual theme from article content (coverKeywords weighted heavily). */
export function detectCoverTheme(input: CoverImageInput): string | null {
  const weightedParts: { text: string; weight: number }[] = [
    { text: input.title, weight: 2 },
    { text: input.excerpt ?? "", weight: 2 },
    { text: input.tags?.join(" ") ?? "", weight: 1 },
    ...(input.coverKeywords ?? []).map((keyword) => ({ text: keyword, weight: 5 })),
  ];

  let bestTheme: string | null = null;
  let bestScore = 0;

  for (const rule of THEME_RULES) {
    let score = 0;
    for (const part of weightedParts) {
      if (!part.text.trim()) continue;
      for (const pattern of rule.patterns) {
        if (pattern.test(part.text)) score += 2 * part.weight;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestTheme = rule.theme;
    }
  }

  if (bestScore >= 2) return bestTheme;

  return CATEGORY_THEME[input.categorySlug] ?? null;
}

function poolForArticle(input: CoverImageInput): string[] {
  const theme = detectCoverTheme(input);
  const categoryPool = CATEGORY_COVER_POOLS[input.categorySlug];
  const cat = CATEGORIES.find((c) => c.slug === input.categorySlug);
  const bannerId = cat?.banner?.match(/photo-[^/?]+/)?.[0];

  const base =
    categoryPool?.length ? categoryPool : bannerId ? [bannerId] : [];

  if (theme && THEME_POOLS[theme]?.length) {
    return dedupePhotos([...THEME_POOLS[theme]!, ...base, ...GLOBAL_POOL]);
  }

  return dedupePhotos([...base, ...GLOBAL_POOL]);
}

function normalizeCoverUrl(url: string | null | undefined): string {
  if (!url?.trim()) return "";
  try {
    const parsed = new URL(url.trim());
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split("?")[0] ?? "";
  }
}

function isUserUpload(url: string | null | undefined): boolean {
  const u = url?.trim() ?? "";
  return u.startsWith("/uploads/") || u.includes("/uploads/");
}

/** Pick a content-relevant cover; rotates within themed pool if URL is taken. */
export function pickArticleCoverImage(
  input: CoverImageInput,
  takenUrls?: ReadonlySet<string>
): string {
  const pool = poolForArticle(input);
  const primaryKeyword = input.coverKeywords?.find((k) => k.trim()) ?? "";
  const seed = `${input.uniqueKey ?? input.slug ?? ""}|${input.title}|${primaryKeyword}|${detectCoverTheme(input) ?? input.categorySlug}`;
  const start = hashString(seed) % pool.length;

  for (let i = 0; i < pool.length; i++) {
    const url = unsplash(pool[(start + i) % pool.length]!);
    const norm = normalizeCoverUrl(url);
    if (!takenUrls?.has(norm)) return url;
  }

  for (let salt = 0; salt < 64; salt++) {
    const url = picsumCover(`${seed}|${salt}`);
    const norm = normalizeCoverUrl(url);
    if (!takenUrls?.has(norm)) return url;
  }

  return picsumCover(`${seed}|final`);
}

function picsumCover(seed: string): string {
  return `https://picsum.photos/seed/${hashString(seed)}/1600/900`;
}

export function assignUniqueCovers<
  T extends {
    id?: string;
    slug: string;
    title: string;
    excerpt?: string | null;
    coverImage: string | null;
    categorySlug: string;
    tags?: string[];
    coverKeywords?: string[];
  },
>(rows: T[]): Map<string, string> {
  const assignments = new Map<string, string>();
  const taken = new Set<string>();

  for (const row of rows) {
    if (isUserUpload(row.coverImage)) {
      const norm = normalizeCoverUrl(row.coverImage);
      taken.add(norm);
      assignments.set(row.slug, row.coverImage!);
      continue;
    }

    let attempt = 0;
    let cover = "";
    do {
      cover = pickArticleCoverImage(
        {
          categorySlug: row.categorySlug,
          title: row.title,
          excerpt: row.excerpt ?? undefined,
          slug: row.slug,
          tags: row.tags,
          coverKeywords: row.coverKeywords,
          uniqueKey: row.id ? `${row.id}-${attempt}` : `${row.slug}-${attempt}`,
        },
        taken
      );
      attempt++;
    } while (taken.has(normalizeCoverUrl(cover)) && attempt < 80);

    taken.add(normalizeCoverUrl(cover));
    assignments.set(row.slug, cover);
  }

  return assignments;
}

export function isGenericCategoryCover(
  coverImage: string | null | undefined,
  categorySlug: string | null | undefined
): boolean {
  if (!coverImage?.trim() || !categorySlug) return false;
  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!cat?.banner) return false;
  return normalizeCoverUrl(coverImage) === normalizeCoverUrl(cat.banner);
}

export { normalizeCoverUrl, unsplash, isUserUpload };
