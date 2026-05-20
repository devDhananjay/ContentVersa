import { PollWidget } from "@/components/blog/poll-widget";

export function QuickPollSection() {
  return (
    <section className="container py-12 md:py-16">
      <div className="max-w-xl mx-auto">
        <PollWidget />
      </div>
    </section>
  );
}
