import { PollWidget } from "@/components/blog/poll-widget";
import { getDailyPollSlug } from "@/lib/polls/daily";

export function QuickPollSection() {
  const pollSlug = getDailyPollSlug();
  return (
    <section className="container py-12 md:py-16">
      <div className="max-w-xl mx-auto">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Poll of the day
        </p>
        <PollWidget pollSlug={pollSlug} />
      </div>
    </section>
  );
}
