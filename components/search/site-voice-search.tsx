"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoiceSearchButton } from "@/components/search/voice-search-button";
import { useVoiceSearch } from "@/lib/hooks/use-voice-search";
import { cn } from "@/lib/utils";

type SiteVoiceSearchProps = {
  placeholder?: string;
  /** Where to navigate on submit / voice final. Default `/blogs`. */
  searchPath?: string;
  /** Live filter callback (e.g. news desk) — still navigates if `navigateOnSubmit`. */
  onQueryChange?: (query: string) => void;
  /** Auto-navigate when voice finishes. Default true. */
  navigateOnVoice?: boolean;
  navigateOnSubmit?: boolean;
  size?: "hero" | "bar";
  className?: string;
  inputClassName?: string;
  initialQuery?: string;
};

export function SiteVoiceSearch({
  placeholder = "Search…",
  searchPath = "/blogs",
  onQueryChange,
  navigateOnVoice = true,
  navigateOnSubmit = true,
  size = "bar",
  className,
  inputClassName,
  initialQuery = "",
}: SiteVoiceSearchProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState(initialQuery);

  const navigateTo = React.useCallback(
    (raw: string) => {
      const q = raw.trim();
      const base = searchPath.split("?")[0] || "/blogs";
      router.push(q ? `${base}?q=${encodeURIComponent(q)}` : base);
    },
    [router, searchPath]
  );

  const voice = useVoiceSearch({
    lang: "en-IN",
    onFinal: (transcript) => {
      const q = transcript.trim();
      setQuery(q);
      onQueryChange?.(q);
      if (navigateOnVoice) navigateTo(q);
    },
  });

  const displayValue =
    voice.listening && voice.interim ? voice.interim : query;

  const isHero = size === "hero";

  return (
    <div className={cn("w-full", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const q = query.trim();
          onQueryChange?.(q);
          if (navigateOnSubmit) navigateTo(q);
        }}
        className={cn("relative group", isHero && "w-full max-w-2xl")}
      >
        {isHero ? (
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/40 to-[hsl(var(--saffron)/0.4)] opacity-0 blur-lg transition-opacity duration-500 group-focus-within:opacity-70" />
        ) : null}
        <div className="relative">
          <Search
            className={cn(
              "absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground",
              isHero ? "left-4 h-5 w-5 sm:left-5" : "h-4 w-4"
            )}
          />
          <Input
            name="q"
            value={displayValue}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              onQueryChange?.(v.trim());
            }}
            placeholder={
              voice.listening ? "Listening… speak now" : placeholder
            }
            autoComplete="off"
            aria-label="Search"
            className={cn(
              voice.listening && "ring-2 ring-primary/30 border-primary/40",
              isHero
                ? "h-12 rounded-2xl border-border bg-card pl-12 pr-36 text-base shadow-glow backdrop-blur sm:h-16 sm:pl-14 sm:pr-44"
                : "h-11 rounded-full pl-10 pr-24 text-sm",
              inputClassName
            )}
          />
          <div
            className={cn(
              "absolute top-1/2 flex -translate-y-1/2 items-center gap-1",
              isHero ? "right-1.5 sm:right-2" : "right-1.5"
            )}
          >
            <VoiceSearchButton
              supported={voice.supported}
              listening={voice.listening}
              size={isHero ? "md" : "sm"}
              onToggle={() => {
                if (voice.listening) voice.stop();
                else voice.start();
              }}
            />
            {isHero ? (
              <Button
                type="submit"
                variant="gradient"
                className="h-9 rounded-xl px-3 text-sm sm:h-12 sm:px-4 sm:text-base"
              >
                Search
                <ArrowRight className="hidden h-4 w-4 sm:inline" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="sm"
                variant="gradient"
                className="h-8 rounded-full px-3 text-xs"
              >
                Search
              </Button>
            )}
          </div>
        </div>
      </form>
      {voice.error ? (
        <p className="mt-2 text-left text-xs text-destructive" role="status">
          {voice.error}
        </p>
      ) : voice.listening ? (
        <p className="mt-2 text-left text-xs text-muted-foreground" role="status">
          Listening… speak your search
        </p>
      ) : null}
    </div>
  );
}
