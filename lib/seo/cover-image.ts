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

/** Themed pools — never map a keyword to a single image (that caused duplicates). */
const THEME_POOLS: Record<string, string[]> = {
  health: [
    "photo-1576091160399-112ba8d25d1d",
    "photo-1579684385127-1ef15d508118",
    "photo-1559757142-8d58055f3272",
    "photo-1505751172876-fa1923c5c528",
    "photo-1571019613454-1cb2f99b2d8b",
    "photo-1581056771100-24da4f558f1e",
  ],
  career: [
    "photo-1521737711867-e3b97375f902",
    "photo-1552664730-d307ca884978",
    "photo-1507679799987-c73779587ccf",
    "photo-1553877522-43269d4ea984",
    "photo-1522071820081-009f0129c71c",
    "photo-1600880292203-757bb62b4baf",
  ],
  business: [
    "photo-1556761175-5973dc0f32e7",
    "photo-1460925895917-afdab827c52f",
    "photo-1454165804606-c3d57bc86b40",
    "photo-1556761175-b413da4baf72",
    "photo-1559136555-9303baea8ebd",
    "photo-1553877522-43269d4ea984",
  ],
  robotics: [
    "photo-1535378917022-2d7001f6ffc2",
    "photo-1485828742530-039875a3b7aa",
    "photo-1677756119517-28364c2f4f70",
    "photo-1555255707-c079660bb026",
  ],
  code: [
    "photo-1504639725590-34d0984388bd",
    "photo-1555066931-4365d14bab8c",
    "photo-1461749280684-dccba630e2f0",
    "photo-1516116216624-53e697fedbea",
    "photo-1587620962725-abab7fe55159",
    "photo-1517694712202-14dd9538aa60",
  ],
  data: [
    "photo-1551288049-bebda4e38f71",
    "photo-1624127458585-38cec0be38c5",
    "photo-1635070041078-e363dbe005cb",
    "photo-1550751827-4bd374c3f58b",
    "photo-1544383835-bda2bc66a55d",
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
    "photo-1559526324-4b87b5e36e44",
  ],
  travel: [
    "photo-1506905925346-21bda4d32df4",
    "photo-1524492412937-280b9ca8c063",
    "photo-1477587458883-47145ed94245",
    "photo-1469854523086-cc02fe5d8800",
  ],
  lifestyle: [
    "photo-1499203733215-cf7c4ef07edb",
    "photo-1523240795612-9a054b0db644",
    "photo-1529156069898-49953e39b3ac",
  ],
};

const THEME_RULES: { theme: string; patterns: RegExp[] }[] = [
  {
    theme: "health",
    patterns: [
      /\bhealthcare\b/i,
      /\bmedical\b/i,
      /\bhospital\b/i,
      /\bdiagnostic/i,
      /\brural health\b/i,
    ],
  },
  {
    theme: "career",
    patterns: [/\bcareer\b/i, /\bskills\b/i, /\bprofessional/i, /\bworkforce\b/i],
  },
  {
    theme: "business",
    patterns: [/\bsme\b/i, /\bstartup/i, /\bproductivity\b/i, /\bentrepreneur/i],
  },
  {
    theme: "robotics",
    patterns: [/\brobot/i, /\bvision\b/i, /\bcomputer vision\b/i],
  },
  {
    theme: "cloud",
    patterns: [/\bdevops\b/i, /\bserverless\b/i, /\baws\b/i, /\bcloud\b/i, /\bkubernetes\b/i],
  },
  {
    theme: "finance",
    patterns: [/\binvest/i, /\bsip\b/i, /\bmutual fund/i, /\bnifty\b/i, /\bstock\b/i],
  },
  {
    theme: "travel",
    patterns: [/\btravel\b/i, /\bitinerary\b/i, /\bweekend\b/i, /\bgetaway\b/i],
  },
  {
    theme: "code",
    patterns: [/\bprogramming\b/i, /\btypescript\b/i, /\bjavascript\b/i, /\bpython\b/i, /\bnext\.?js\b/i],
  },
  {
    theme: "data",
    patterns: [/\bdata\b/i, /\banalytics\b/i, /\bllm\b/i, /\bgemini\b/i, /\bgpt\b/i],
  },
];

const CATEGORY_COVER_POOLS: Record<string, string[]> = {
  technology: [
    "photo-1518770660439-4636190af475",
    "photo-1496181133206-282ce4d0e50e",
    "photo-1544197150-b99a580bb7a8",
    "photo-1550751827-4bd374c3f58b",
    "photo-1504639725590-34d0984388bd",
    "photo-1516321318423-f06f85e504b3",
    "photo-1558494949-ef010cbdcc31",
    "photo-1587620962725-abab7fe55159",
    "photo-1511707171634-5f897ff02aa9",
    "photo-1551288049-bebda4e38f71",
    ...THEME_POOLS.code,
    ...THEME_POOLS.cloud,
  ],
  ai: [
    "photo-1677442136019-21780ecad995",
    "photo-1620712943543-bcc4688e7485",
    "photo-1535378917022-2d7001f6ffc2",
    "photo-1677756119517-28364c2f4f70",
    "photo-1485828742530-039875a3b7aa",
    "photo-1555255707-c079660bb026",
    "photo-1635070041078-e363dbe005cb",
    "photo-1555949963-aa79dcee981c",
    "photo-1516321318423-f06f85e504b3",
    "photo-1589254065878-42c9da977008",
    "photo-1558618666-fcd25c85cd64",
    "photo-1611162616305-c69b3fa7fa5f",
    "photo-1488590528505-98d2b5aba04b",
    "photo-1526374965328-7f61d4dc18c5",
    "photo-1531297484001-80022131f5a1",
    "photo-1550745165-9bc0b252726f",
    ...THEME_POOLS.data,
    ...THEME_POOLS.robotics,
    ...THEME_POOLS.code,
  ],
  programming: [
    "photo-1555066931-4365d14bab8c",
    "photo-1544383835-bda2bc66a55d",
    "photo-1461749280684-dccba630e2f0",
    "photo-1516116216624-53e697fedbea",
    "photo-1555066931-bf19ed8bbe93",
    ...THEME_POOLS.code,
  ],
  business: [...THEME_POOLS.business, "photo-1664575599736-c5197c684128"],
  finance: [...THEME_POOLS.finance],
  startups: [
    "photo-1664575599736-c5197c684128",
    "photo-1522071820081-009f0129c71c",
    ...THEME_POOLS.business,
  ],
  travel: [...THEME_POOLS.travel, "photo-1602216051446-39c65eeef257"],
  food: [
    "photo-1490645935967-10de8baacd69",
    "photo-1504674900247-0877df9cc836",
    "photo-1546069901-ba9599a7e63c",
    "photo-1565299624946-b28f40a0ae38",
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
    "photo-1552820728-8b83bb6b773f",
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
  fashion: [
    "photo-1483985988355-763728e1935b",
    "photo-1445205170230-053b83016050",
    "photo-1515886657613-9f3515b0c78f",
  ],
  lifestyle: [...THEME_POOLS.lifestyle],
  education: [
    "photo-1434030216411-0b793f4b4173",
    "photo-1503676260728-1c00da094a0b",
    "photo-1427504494785-3a9ca7044f45",
  ],
  health: [...THEME_POOLS.health],
  science: [
    "photo-1532094349884-543bc11b234d",
    "photo-1507413245164-616864d41ce9",
    "photo-1582719478250-c89cae4dc85b",
  ],
  news: [
    "photo-1495020689067-958852a7765e",
    "photo-1504711434969-e33886168f5c",
    "photo-1586339949912-96e4b1d5c4a0",
  ],
  culture: [
    "photo-1516450360452-9312f5e86fc7",
    "photo-1492684223066-81342ee5ff30",
    "photo-1514525253161-7a46d19cd819",
  ],
  design: [
    "photo-1561070791-2526d30994b5",
    "photo-1558655146-d09347e92766",
    "photo-1618005182384-a83a8bd57fbe",
  ],
  marketing: [
    "photo-1432888622747-4eb9a8efeb07",
    "photo-1557839473-10937981ce17",
    "photo-1460925895917-afdab827c52f",
  ],
};

const GLOBAL_POOL = dedupePhotos([
  ...Object.values(CATEGORY_COVER_POOLS).flat(),
  ...Object.values(THEME_POOLS).flat(),
  "photo-1517245386807-bb43f82c33c4",
  "photo-1499750310107-5fef28a66643",
  "photo-1456324504434-577a2dd8b071",
  "photo-1504384308090-c894fdcc538d",
]);

function dedupePhotos(ids: string[]): string[] {
  return [...new Set(ids)];
}

function detectTheme(haystack: string): string | null {
  for (const rule of THEME_RULES) {
    if (rule.patterns.some((p) => p.test(haystack))) return rule.theme;
  }
  return null;
}

function poolForArticle(input: {
  categorySlug: string;
  title: string;
  tags?: string[];
}): string[] {
  const haystack = `${input.title} ${input.tags?.join(" ") ?? ""}`;
  const theme = detectTheme(haystack);
  const categoryPool = CATEGORY_COVER_POOLS[input.categorySlug];
  const cat = CATEGORIES.find((c) => c.slug === input.categorySlug);
  const bannerId = cat?.banner?.match(/photo-[^/?]+/)?.[0];

  const base = categoryPool?.length
    ? categoryPool
    : bannerId
      ? [bannerId, ...GLOBAL_POOL]
      : GLOBAL_POOL;

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

/** Pick a cover from pool using slug/title hash — rotates if URL already taken. */
export function pickArticleCoverImage(
  input: {
    categorySlug: string;
    title: string;
    tags?: string[];
    slug?: string;
    uniqueKey?: string;
  },
  takenUrls?: ReadonlySet<string>
): string {
  const pool = poolForArticle(input);
  const seed = `${input.uniqueKey ?? input.slug ?? ""}|${input.title}|${input.categorySlug}`;
  const start = hashString(seed) % pool.length;

  for (let i = 0; i < pool.length; i++) {
    const url = unsplash(pool[(start + i) % pool.length]!);
    const norm = normalizeCoverUrl(url);
    if (!takenUrls?.has(norm)) return url;
  }

  const globalStart = hashString(`${seed}|fallback`) % GLOBAL_POOL.length;
  for (let i = 0; i < GLOBAL_POOL.length; i++) {
    const url = unsplash(GLOBAL_POOL[(globalStart + i) % GLOBAL_POOL.length]!);
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

/** Assign a globally unique cover across many blogs (for DB backfill). */
export function assignUniqueCovers<
  T extends {
    id?: string;
    slug: string;
    title: string;
    coverImage: string | null;
    categorySlug: string;
    tags?: string[];
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
          slug: row.slug,
          tags: row.tags,
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

export function isDuplicateCoverGroup(count: number): boolean {
  return count > 1;
}

export { normalizeCoverUrl, unsplash, isUserUpload, GLOBAL_POOL };
