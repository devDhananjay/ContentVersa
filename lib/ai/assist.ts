/**
 * AI writing helpers — uses OpenAI when OPENAI_API_KEY is set,
 * otherwise returns smart heuristic suggestions (works offline / demo).
 */

export type AiAction =
  | "summarize"
  | "seo-title"
  | "blog-ideas"
  | "excerpt"
  | "tags"
  | "image-prompt"
  | "generate-image"
  | "expand-thesis";

type AssistInput = {
  action: AiAction;
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  imagePrompt?: string;
};

async function callOpenAI(system: string, user: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user.slice(0, 12000) },
      ],
      max_tokens: 800,
      temperature: 0.7,
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

function firstSentence(text: string, max = 160) {
  const s = text.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  return s.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function heuristicAssist(input: AssistInput): string | string[] {
  const title = input.title?.trim() || "Your next big idea";
  const content = input.content?.trim() || "";
  const words = content.split(/\s+/).filter(Boolean);
  const cat = input.category || "technology";

  switch (input.action) {
    case "summarize":
      if (!content) return "Add some body text first, then we can summarize it.";
      return firstSentence(content, 280);

    case "seo-title": {
      const base = title.length > 55 ? firstSentence(title, 55) : title;
      const suffixes = [
        " — A Creator's Guide",
        " | What Nobody Tells You",
        " (2026 Edition)",
      ];
      return `${base}${suffixes[Math.floor(Math.random() * suffixes.length)]}`.slice(
        0,
        70
      );
    }

    case "blog-ideas":
      return [
        `Why ${cat} creators are winning in 2026`,
        `5 mistakes I made writing about ${title}`,
        `The contrarian take on ${title}`,
        `From zero to audience: a ${cat} playbook`,
        `What experts won't say about ${title}`,
      ];

    case "excerpt":
      if (content) return firstSentence(content, 200);
      return `A sharp take on ${title} — written for builders who ship in public.`;

    case "tags": {
      const fromTitle = title
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3)
        .slice(0, 3);
      return [...new Set([cat, ...fromTitle, "creators", "essay"])].slice(0, 5);
    }

    case "image-prompt":
      return `Editorial cover illustration for an article titled "${title}", ${cat} theme, modern minimalist, soft gradient lighting, no text, 16:9`;

    case "expand-thesis":
      if (!content && !title)
        return "Start with a bold claim in your title, then support it with 3 concrete examples.";
      return `Thesis: ${title}\n\n1. Hook — state the problem readers feel today.\n2. Evidence — ${words.length} words of draft; add one data point or story.\n3. Takeaway — what should the reader do in the next 24 hours?`;

    default:
      return "Unknown action.";
  }
}

export async function runAiAssist(
  input: AssistInput
): Promise<{ result: string | string[]; source: "openai" | "local" }> {
  const userPayload = JSON.stringify({
    title: input.title,
    excerpt: input.excerpt,
    content: input.content?.slice(0, 4000),
    category: input.category,
    imagePrompt: input.imagePrompt,
  });

  if (input.action === "generate-image") {
    return { result: buildPlaceholderImageUrl(input.imagePrompt || input.title || ""), source: "local" };
  }

  const prompts: Record<Exclude<AiAction, "generate-image">, { system: string; expect: "text" | "list" }> = {
    summarize: {
      system: "Summarize the blog draft in 2-3 sentences for a card excerpt. Plain text only.",
      expect: "text",
    },
    "seo-title": {
      system: "Write one SEO meta title under 70 characters. Return only the title.",
      expect: "text",
    },
    "blog-ideas": {
      system: "Return exactly 5 blog post title ideas as a JSON array of strings.",
      expect: "list",
    },
    excerpt: {
      system: "Write a compelling 1-2 sentence excerpt. Plain text only.",
      expect: "text",
    },
    tags: {
      system: "Return 5 URL slug tags as a JSON array of lowercase hyphenated strings.",
      expect: "list",
    },
    "image-prompt": {
      system: "Write one detailed image generation prompt for a blog cover. Plain text only.",
      expect: "text",
    },
    "expand-thesis": {
      system: "Outline a blog structure: hook, 3 sections, conclusion. Use markdown bullets.",
      expect: "text",
    },
  };

  const p = prompts[input.action];
  const ai = await callOpenAI(p.system, userPayload);

  if (ai) {
    if (p.expect === "list") {
      try {
        const parsed = JSON.parse(ai) as string[];
        if (Array.isArray(parsed)) {
          return { result: parsed.slice(0, 5), source: "openai" };
        }
      } catch {
        const lines = ai.split("\n").filter((l) => l.trim()).slice(0, 5);
        return { result: lines, source: "openai" };
      }
    }
    return { result: ai, source: "openai" };
  }

  const local = heuristicAssist(input);
  return { result: local, source: "local" };
}

/** Placeholder image URL from prompt (no paid API required). */
export function buildPlaceholderImageUrl(prompt: string): string {
  const seed = encodeURIComponent(prompt.slice(0, 80) || "contentverse");
  return `https://picsum.photos/seed/${seed}/1600/900`;
}
