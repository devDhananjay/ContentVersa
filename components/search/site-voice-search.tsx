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
  /** Where to navigate on submit / voice final. Default `/search`. */
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
  /** Controlled query (e.g. news desk trending chips). */
  value?: string;
};

export function SiteVoiceSearch({
  placeholder = "Search…",
  searchPath = "/search",
  onQueryChange,
  navigateOnVoice = true,
  navigateOnSubmit = true,
  size = "bar",
  className,
  inputClassName,
  initialQuery = "",
  value,
}: SiteVoiceSearchProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState(value ?? initialQuery);

  React.useEffect(() => {
    if (value !== undefined) setQuery(value);
  }, [value]);

  const navigateTo = React.useCallback(
    (raw: string) => {
      const q = raw.trim();
      const base = searchPath.split("?")[0] || "/search";
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
        className={cn("relative group w-full", isHero && "mx-auto")}
      >
        {isHero ? (
          <div className="absolute -inset-px rounded-full bg-gradient-to-r from-foreground/10 via-primary/30 to-[hsl(var(--saffron)/0.35)] opacity-50 transition-opacity duration-300 group-focus-within:opacity-90" />
        ) : null}
        <div className="relative">
          <Search
            className={cn(
              "absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground",
              isHero ? "left-4 h-4 w-4" : "h-4 w-4"
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
              voice.listening && "ring-2 ring-primary/25 border-primary/35",
              isHero
                ? "h-11 rounded-full border-border/55 bg-card/90 pl-11 pr-28 text-sm shadow-[0_1px_0_hsl(0_0%_100%/0.7)_inset,0_14px_36px_-20px_hsl(235_30%_20%/0.32)] backdrop-blur-xl transition-[box-shadow,border-color] focus-visible:border-foreground/25 focus-visible:shadow-[0_1px_0_hsl(0_0%_100%/0.7)_inset,0_16px_40px_-18px_hsl(var(--primary)/0.28)] sm:h-12 sm:pl-12 sm:pr-32"
                : "h-11 rounded-full pl-10 pr-24 text-sm",
              inputClassName
            )}
          />
          <div
            className={cn(
              "absolute top-1/2 flex -translate-y-1/2 items-center gap-0.5",
              isHero ? "right-1.5" : "right-1.5"
            )}
          >
            <VoiceSearchButton
              supported={voice.supported}
              listening={voice.listening}
              size="sm"
              onToggle={() => {
                if (voice.listening) voice.stop();
                else voice.start();
              }}
            />
            {isHero ? (
              <Button
                type="submit"
                size="sm"
                variant="default"
                className="h-8 rounded-full bg-foreground px-3.5 text-xs font-medium text-background transition-transform hover:bg-foreground/90 active:scale-[0.98]"
              >
                Search
                <ArrowRight className="h-3.5 w-3.5" />
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
        <p
          className={cn(
            "mt-2 text-xs text-destructive",
            isHero ? "text-center" : "text-left"
          )}
          role="status"
        >
          {voice.error}
        </p>
      ) : voice.listening ? (
        <p
          className={cn(
            "mt-2 text-xs text-muted-foreground",
            isHero ? "text-center" : "text-left"
          )}
          role="status"
        >
          Listening… speak your search
        </p>
      ) : null}
    </div>
  );
}
