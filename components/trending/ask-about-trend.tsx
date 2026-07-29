"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openHelpChat } from "@/components/help/help-chat-widget";

export function AskAboutTrend({ title }: { title: string }) {
  return (
    <Button
      type="button"
      variant="gradient"
      size="sm"
      className="gap-2"
      onClick={() =>
        openHelpChat({
          prompt: `Explain this trending topic in simple words for an Indian reader: "${title}". What happened, why is it trending, and what should I know? Keep it short.`,
        })
      }
    >
      <MessageCircle className="h-4 w-4" />
      Ask chat about this
    </Button>
  );
}
