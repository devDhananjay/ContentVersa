import { PrismaClient } from "@prisma/client";
import { loadScriptEnv } from "./load-script-env";
import { readingTime } from "../lib/utils";

loadScriptEnv();

const SLUG = "10-must-watch-family-movies-on-ott-for-your-summer-holidays-2026";

const TITLE =
  "10 Must-Watch Family Movies on OTT for Your Summer Holidays 2026";

const EXCERPT =
  "Planning a summer movie marathon with kids and grandparents? Here are ten family-friendly films on Netflix, Disney+ Hotstar, Prime Video, and JioCinema that are worth your popcorn in 2026.";

const META_DESCRIPTION =
  "Ten family-friendly movies on Indian OTT platforms for summer 2026—Netflix, Disney+ Hotstar, Prime Video, and JioCinema picks for kids, teens, and parents.";

const CONTENT = `## Introduction

School is out, the AC is on, and every evening someone in the house asks the same question: *"Kuch accha family movie hai kya?"* Summer 2026 is packed with strong options on Indian streaming apps—not just cartoons for toddlers, but films grandparents, teens, and parents can enjoy together.

This list focuses on titles you can watch **right now** on major OTT platforms in India. We picked stories with heart, humour, and replay value—the kind you can queue on a rainy afternoon or a long weekend road-trip break.

---

## How we picked these films

- **Family-safe tone** — no gratuitous violence or awkward scenes for mixed-age viewing  
- **Available on Indian OTT** — Netflix, Disney+ Hotstar, Prime Video, or JioCinema (availability can change; check your app before planning)  
- **Rewatch appeal** — jokes land differently on the second watch  
- **Mix of Hindi and international** — something for every mood

---

## 1. *Inside Out 2* — Disney+ Hotstar

Pixar's sequel dives back into Riley's mind as she enters her teenage years. New emotions join the crew, and the film handles anxiety and friendship with surprising honesty. Kids get colour and comedy; adults get moments that feel uncomfortably real—in the best way.

**Best for:** Ages 8+ · **Mood:** Emotional but uplifting  
**Why stream it:** Perfect conversation starter about feelings after the credits roll.

---

## 2. *Kung Fu Panda 4* — Netflix

Po is back with slick animation, martial-arts set pieces, and the same underdog charm that made the franchise a household name. Light enough for younger viewers, sharp enough that parents won't check their phones.

**Best for:** Ages 6+ · **Mood:** Action-comedy  
**Why stream it:** Short runtime, high energy—ideal when everyone is tired but still wants "one more movie."

---

## 3. *The Wild Robot* — JioCinema / Prime Video

A robot stranded on a wild island learns to care for an orphaned gosling. Stunning visuals, gentle pacing, and themes about belonging and parenting without preaching. One of the most beautiful family films of recent years.

**Best for:** Ages 7+ · **Mood:** Adventure + warmth  
**Why stream it:** Works as a "quiet Sunday" pick when you want wonder, not noise.

---

## 4. *Laapataa Ladies* — Netflix

Kiran Rao's gentle comedy about two brides swapped on a train is witty, warm, and rooted in small-town India. No flashy VFX—just sharp writing and performances that work across generations. A refreshing Hindi pick when everyone is tired of dubbed animation.

**Best for:** Ages 10+ · **Mood:** Feel-good comedy-drama  
**Why stream it:** Great way to introduce kids to parallel cinema without a lecture.

---

## 5. *Moana 2* — Disney+ Hotstar

Moana sails again with songs you'll hum for days. The sequel leans into exploration, identity, and teamwork—themes that land whether you're eight or forty-eight.

**Best for:** Ages 5+ · **Mood:** Musical adventure  
**Why stream it:** Sing-along potential = instant summer bonding.

---

## 6. *Migration* — Netflix

A duck family faces their first long migration south. Illumination's colour palette pops on a big TV, and the story about courage and sticking together is simple without being silly.

**Best for:** Ages 4+ · **Mood:** Light adventure  
**Why stream it:** Great entry point for toddlers joining an older sibling's movie night.

---

## 7. *12th Fail* — Disney+ Hotstar

Not a cartoon—a biographical drama about UPSC aspirant Manoj Kumar Sharma. Inspiring, dialogue-rich, and a favourite for parents who want "something meaningful" on a summer night. Older kids (10+) often get hooked by the underdog arc.

**Best for:** Ages 10+ · **Mood:** Inspiring drama  
**Why stream it:** Sparks real talk about exams, grit, and second chances.

---

## 8. *Wish* — Disney+ Hotstar

Disney's original fairy tale about a kingdom where wishes are stolen feels classic from frame one. Musical numbers, a brave heroine, and a runtime that won't exhaust younger viewers.

**Best for:** Ages 5+ · **Mood:** Fairy-tale musical  
**Why stream it:** Safe bet when your group can't agree on anything else.

---

## 9. *Spider-Man: Across the Spider-Verse* — Netflix

Multiverse chaos, jaw-dropping animation, and a story about growing up and letting go. Teens love it; adults appreciate the craft. Some intense action—preview with under-8s if needed.

**Best for:** Ages 8+ · **Mood:** Superhero spectacle  
**Why stream it:** The kind of film that makes kids ask how animation is made.

---

## 10. *Panchayat* (Season 3) — Prime Video

Technically a series, but nothing beats curling up for three episodes on a lazy summer afternoon. Gentle humour, rural Uttar Pradesh setting, and characters who feel like neighbours. Grandparents and Gen Z quote it equally.

**Best for:** All ages (mild language) · **Mood:** Comfort comedy-drama  
**Why stream it:** Binge-friendly without overstaying its welcome.

---

## Quick comparison table

| Title | Platform | Age guide | Vibe |
|-------|----------|-----------|------|
| Inside Out 2 | Disney+ Hotstar | 8+ | Emotional |
| Kung Fu Panda 4 | Netflix | 6+ | Action-comedy |
| The Wild Robot | JioCinema / Prime | 7+ | Heartwarming |
| Laapataa Ladies | Netflix | 10+ | Comedy-drama |
| Moana 2 | Disney+ Hotstar | 5+ | Musical |
| Migration | Netflix | 4+ | Kids adventure |
| 12th Fail | Disney+ Hotstar | 10+ | Inspiring |
| Wish | Disney+ Hotstar | 5+ | Fairy tale |
| Spider-Verse | Netflix | 8+ | Superhero |
| Panchayat S3 | Prime Video | All ages | Comfort watch |

---

## Tips for a stress-free summer movie night

1. **Rotate who picks** — one choice per family member across the week avoids fights.  
2. **Subtitles on** — helps kids reading along and improves Hindi/English comfort for mixed groups.  
3. **Snack prep before play** — pause wars kill momentum.  
4. **Use CineVerse** — bookmark titles, track what you've finished, and discover what's newly added on OTT each week.

---

## Conclusion

Summer holidays are short; attention spans are shorter. These ten picks balance spectacle, story, and shared laughter across Netflix, Disney+ Hotstar, Prime Video, and JioCinema. Queue one tonight, argue about popcorn flavours, and save the rest for the weeks ahead.

*Streaming availability changes by region and licensing deals. Confirm in your OTT app before planning a marathon.*
`;

async function main() {
  const prisma = new PrismaClient();
  const slug = SLUG;

  const existing = await prisma.blog.findUnique({ where: { slug } });
  if (!existing) {
    console.error("Blog not found:", slug);
    process.exit(1);
  }

  const rt = readingTime(CONTENT);

  const updated = await prisma.blog.update({
    where: { id: existing.id },
    data: {
      title: TITLE,
      excerpt: EXCERPT,
      content: CONTENT,
      metaTitle: `${TITLE} | ContentVerse`,
      metaDescription: META_DESCRIPTION,
      metaKeywords:
        "family movies OTT 2026, summer movies India, Netflix family films, Disney Hotstar kids, Prime Video family, JioCinema movies",
      readingTime: rt,
    },
  });

  console.log("Updated blog:", updated.id, updated.slug, "readingTime:", rt);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
