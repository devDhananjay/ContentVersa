import { BlogCard } from "@/components/blog/blog-card";
import { NextUpPrompt } from "@/components/blog/next-up-prompt";
import { getPersonalizedRecommendations } from "@/lib/data/reading-history";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { cookies } from "next/headers";

export async function RecommendedBlogs({ slug }: { slug: string }) {
  const session = await getCurrentUser();
  const userId = session ? await resolveUserId(session) : null;
  const jar = await cookies();
  const visitorKey = jar.get("cv_reader")?.value ?? null;

  const recommended = await getPersonalizedRecommendations(slug, 4, {
    userId,
    visitorKey,
  });

  if (recommended.length === 0) return null;

  const next = recommended[0]
    ? { slug: recommended[0].slug, title: recommended[0].title }
    : null;

  return (
    <section className="mt-20">
      <h2 className="font-display text-3xl font-extrabold tracking-tight mb-2">
        Blogs you may like
      </h2>
      <p className="text-muted-foreground mb-8">
        Based on what you&apos;ve been reading — keep the streak going
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {recommended.slice(0, 3).map((b, i) => (
          <BlogCard key={b.id} blog={b} index={i} />
        ))}
      </div>
      <NextUpPrompt next={next} />
    </section>
  );
}
