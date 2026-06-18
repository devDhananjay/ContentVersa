import { CATEGORIES } from "@/lib/data/categories";

const UNSPLASH_PARAMS = "w=1600&auto=format&fit=crop";

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?${UNSPLASH_PARAMS}`;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Keyword → image for topic-aware covers (checked before category pool). */
const TOPIC_KEYWORD_IMAGES: { keywords: string[]; image: string }[] = [
  {
    keywords: ["health", "healthcare", "hospital", "medical", "diagnostic", "doctor", "rural health"],
    image: "photo-1576091160399-112ba8d25d1d",
  },
  {
    keywords: ["career", "skills", "professional", "job", "resume", "workforce", "future-proof"],
    image: "photo-1521737711867-e3b97375f902",
  },
  {
    keywords: ["sme", "small business", "startup", "productivity", "sales", "entrepreneur"],
    image: "photo-1556761175-5973dc0f32e7",
  },
  {
    keywords: ["vision", "image recognition", "computer vision", "camera", "photo ai"],
    image: "photo-1558618666-fcd25c85cd64",
  },
  {
    keywords: ["voice", "speech", "audio", "assistant", "chatbot", "vernacular", "language"],
    image: "photo-1589254065878-42c9da977008",
  },
  {
    keywords: ["llm", "gpt", "gemini", "chatgpt", "bharatgpt", "model", "generative"],
    image: "photo-1677442136019-21780ecad995",
  },
  {
    keywords: ["agent", "automation", "workflow", "tool"],
    image: "photo-1620712943543-bcc4688e7485",
  },
  {
    keywords: ["invest", "stock", "sip", "mutual fund", "nifty", "portfolio", "trading"],
    image: "photo-1611974789855-9c2a0a7236a3",
  },
  {
    keywords: ["tax", "gst", "itr", "income tax", "deduction"],
    image: "photo-1450101499163-c8848c66ca85",
  },
  {
    keywords: ["travel", "trip", "itinerary", "weekend", "getaway", "tourist"],
    image: "photo-1506905925346-21bda4d32df4",
  },
  {
    keywords: ["food", "recipe", "cooking", "kitchen", "restaurant"],
    image: "photo-1490645935967-10de8baacd69",
  },
  {
    keywords: ["fitness", "workout", "gym", "yoga", "wellness"],
    image: "photo-1517836357463-d25dfeac3438",
  },
  {
    keywords: ["movie", "film", "bollywood", "cinema", "ott", "theatre"],
    image: "photo-1485846234645-a62644f84728",
  },
  {
    keywords: ["game", "gaming", "esports", "stream"],
    image: "photo-1542751371-adc38448a05e",
  },
  {
    keywords: ["cricket", "ipl", "sports", "football", "match"],
    image: "photo-1531419140105-6e857e659f72",
  },
  {
    keywords: ["fashion", "style", "outfit", "wardrobe"],
    image: "photo-1483985988355-763728e1935b",
  },
  {
    keywords: ["education", "student", "exam", "learning", "study"],
    image: "photo-1434030216411-0b793f4b4173",
  },
  {
    keywords: ["security", "cyber", "privacy", "hack"],
    image: "photo-1563986768609-322da13575f3",
  },
  {
    keywords: ["cloud", "devops", "kubernetes", "aws", "deploy"],
    image: "photo-1544197150-b99a580bb7a8",
  },
  {
    keywords: ["mobile", "android", "ios", "app"],
    image: "photo-1511707171634-5f897ff02aa9",
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
  ],
  ai: [
    "photo-1677442136019-21780ecad995",
    "photo-1620712943543-bcc4688e7485",
    "photo-1535378917022-2d7001f6ffc2",
    "photo-1677756119517-28364c2f4f70",
    "photo-1485828742530-039875a3b7aa",
    "photo-1555255707-c079660bb026",
    "photo-1635070041078-e363dbe005cb",
    "photo-1504639725590-34d0984388bd",
    "photo-1555949963-aa79dcee981c",
    "photo-1516321318423-f06f85e504b3",
    "photo-1624127458585-38cec0be38c5",
    "photo-1550751827-4bd374c3f58b",
  ],
  programming: [
    "photo-1555066931-4365d14bab8c",
    "photo-1544383835-bda2bc66a55d",
    "photo-1461749280684-dccba630e2f0",
    "photo-1587620962725-abab7fe55159",
    "photo-1516116216624-53e697fedbea",
    "photo-1504639725590-34d0984388bd",
    "photo-1555066931-bf19ed8bbe93",
    "photo-1517694712202-14dd9538aa60",
  ],
  business: [
    "photo-1460925895917-afdab827c52f",
    "photo-1454165804606-c3d57bc86b40",
    "photo-1556761175-5973dc0f32e7",
    "photo-1552664730-d307ca884978",
    "photo-1553877522-43269d4ea984",
    "photo-1507679799987-c73779587ccf",
    "photo-1521737711867-e3b97375f902",
    "photo-1556761175-b413da4baf72",
  ],
  finance: [
    "photo-1611974789855-9c2a0a7236a3",
    "photo-1590283603385-17ffb3a7f29f",
    "photo-1579621970563-ebec7560ff3e",
    "photo-1554224155-6726b3ff858f",
    "photo-1563013547-824ae1b704d3",
    "photo-1610375461246-83c9af3d0f4a",
    "photo-1642790106117-e829e14a801f",
    "photo-1559526324-4b87b5e36e44",
  ],
  startups: [
    "photo-1664575599736-c5197c684128",
    "photo-1556761175-5973dc0f32e7",
    "photo-1522071820081-009f0129c71c",
    "photo-1553877522-43269d4ea984",
    "photo-1559136555-9303baea8ebd",
    "photo-1552664730-d307ca884978",
  ],
  travel: [
    "photo-1506905925346-21bda4d32df4",
    "photo-1524492412937-280b9ca8c063",
    "photo-1477587458883-47145ed94245",
    "photo-1512343879784-a960bf40e7f2",
    "photo-1626621341517-bbf3d9990a23",
    "photo-1602216051446-39c65eeef257",
    "photo-1561361513-2d2a58e2ac28",
    "photo-1469854523086-cc02fe5d8800",
  ],
  food: [
    "photo-1490645935967-10de8baacd69",
    "photo-1504674900247-0877df9cc836",
    "photo-1546069901-ba9599a7e63c",
    "photo-1565299624946-b28f40a0ae38",
    "photo-1517248135467-4c7edcad34c4",
    "photo-1555939594-58d7cb561ad1",
  ],
  fitness: [
    "photo-1517836357463-d25dfeac3438",
    "photo-1571019613454-1cb2f99b2d8b",
    "photo-1505751172876-fa1923c5c528",
    "photo-1534438327276-14e5300c3a48",
    "photo-1518611012118-696072aa579a",
    "photo-1574680096145-d05b474e2155",
  ],
  gaming: [
    "photo-1542751371-adc38448a05e",
    "photo-1611162451917-44d7213e07aa",
    "photo-1511512578047-dfb367046420",
    "photo-1542751371-adc38448a05e",
    "photo-1552820728-8b83bb6b773f",
    "photo-1493711662062-fa541adb3fc8",
  ],
  movies: [
    "photo-1485846234645-a62644f84728",
    "photo-1478720568477-152d9b164e26",
    "photo-1440404653325-ab127d49a1be",
    "photo-1536440136628-849c177e76a1",
    "photo-1574267432644-f610fd9f8380",
    "photo-1594909123339-c62ef957dda9",
  ],
  sports: [
    "photo-1531419140105-6e857e659f72",
    "photo-1461896836934-ffe607ba8211",
    "photo-1574629810360-7efbbe195018",
    "photo-1517649763962-0c62306601b7",
    "photo-1579952363873-27f3bade9f55",
  ],
  fashion: [
    "photo-1483985988355-763728e1935b",
    "photo-1445205170230-053b83016050",
    "photo-1490481651871-ab68de25d43d",
    "photo-1515886657613-9f3515b0c78f",
    "photo-1469334031218-e382a71b716b",
  ],
  lifestyle: [
    "photo-1499203733215-cf7c4ef07edb",
    "photo-1523240795612-9a054b0db644",
    "photo-1502672260266-1c1ef2d93688",
    "photo-1517841905240-472988babdf9",
    "photo-1529156069898-49953e39b3ac",
  ],
  education: [
    "photo-1434030216411-0b793f4b4173",
    "photo-1503676260728-1c00da094a0b",
    "photo-1523050854058-8df90110c9f1",
    "photo-1427504494785-3a9ca7044f45",
    "photo-1497633762265-9d179a990aa6",
  ],
  health: [
    "photo-1576091160399-112ba8d25d1d",
    "photo-1505751172876-fa1923c5c528",
    "photo-1571019613454-1cb2f99b2d8b",
    "photo-1579684385127-1ef15d508118",
    "photo-1559757142-8d58055f3272",
  ],
  science: [
    "photo-1532094349884-543bc11b234d",
    "photo-1507413245164-616864d41ce9",
    "photo-1582719478250-c89cae4dc85b",
    "photo-1576086213369-97a306d36557",
  ],
  news: [
    "photo-1495020689067-958852a7765e",
    "photo-1504711434969-e33886168f5c",
    "photo-1586339949912-96e4b1d5c4a0",
    "photo-1585829365295-ab7cd400c167",
  ],
  culture: [
    "photo-1529156069898-49953e39b3ac",
    "photo-1516450360452-9312f5e86fc7",
    "photo-1492684223066-81342ee5ff30",
    "photo-1514525253161-7a46d19cd819",
  ],
  design: [
    "photo-1561070791-2526d30994b5",
    "photo-1558655146-d09347e92766",
    "photo-1545235617-9465d2a55698",
    "photo-1618005182384-a83a8bd57fbe",
  ],
  marketing: [
    "photo-1432888622747-4eb9a8efeb07",
    "photo-1557839473-10937981ce17",
    "photo-1460925895917-afdab827c52f",
    "photo-1552664730-d307ca884978",
  ],
};

const DEFAULT_POOL = [
  "photo-1517245386807-bb43f82c33c4",
  "photo-1499750310107-5fef28a66643",
  "photo-1456324504434-577a2dd8b071",
  "photo-1504384308090-c894fdcc538d",
];

function normalizeCoverUrl(url: string | null | undefined): string {
  if (!url?.trim()) return "";
  try {
    const parsed = new URL(url.trim());
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split("?")[0] ?? "";
  }
}

/** Pick a distinct, topic-relevant Unsplash cover for an article. */
export function pickArticleCoverImage(input: {
  categorySlug: string;
  title: string;
  tags?: string[];
  slug?: string;
}): string {
  const haystack = `${input.title} ${input.tags?.join(" ") ?? ""}`.toLowerCase();

  for (const entry of TOPIC_KEYWORD_IMAGES) {
    if (entry.keywords.some((kw) => haystack.includes(kw))) {
      return unsplash(entry.image);
    }
  }

  const pool =
    CATEGORY_COVER_POOLS[input.categorySlug] ??
    (() => {
      const cat = CATEGORIES.find((c) => c.slug === input.categorySlug);
      const bannerId = cat?.banner?.match(/photo-[^/?]+/)?.[0];
      return bannerId
        ? [bannerId, ...DEFAULT_POOL]
        : DEFAULT_POOL;
    })();

  const seed = input.slug?.trim() || input.title.trim();
  const idx = hashString(seed) % pool.length;
  return unsplash(pool[idx]!);
}

/** True when cover is still the generic category banner (all AI posts looked identical). */
export function isGenericCategoryCover(
  coverImage: string | null | undefined,
  categorySlug: string | null | undefined
): boolean {
  if (!coverImage?.trim() || !categorySlug) return false;
  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!cat?.banner) return false;
  return normalizeCoverUrl(coverImage) === normalizeCoverUrl(cat.banner);
}

export { normalizeCoverUrl, unsplash };
