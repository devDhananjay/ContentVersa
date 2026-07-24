"use client";

import { parseInlinePollBody, inlinePollSlug } from "@/lib/polls/inline";
import { PollWidget } from "@/components/blog/poll-widget";

/** Renders a ```poll fence from article markdown. */
export function InlinePollEmbed({
  body,
  className,
}: {
  body: string;
  className?: string;
}) {
  const def = parseInlinePollBody(body);
  if (!def) return null;

  return (
    <PollWidget
      pollSlug={inlinePollSlug(def)}
      inlinePoll={def}
      className={className ?? "my-8"}
    />
  );
}
