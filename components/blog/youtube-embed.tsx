import { toYoutubeEmbedUrl } from "@/lib/youtube";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  title?: string;
  className?: string;
};

export function YouTubeEmbed({ src, title = "YouTube video", className }: Props) {
  const embedUrl = toYoutubeEmbedUrl(src);

  if (!embedUrl) {
    return (
      <div
        className={cn(
          "my-8 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-6 text-sm text-muted-foreground",
          className
        )}
      >
        Could not embed this video. Use a YouTube link like{" "}
        <span className="font-mono text-xs">youtube.com/watch?v=…</span>
      </div>
    );
  }

  return (
    <div className={cn("youtube-embed my-8", className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border bg-black shadow-lg">
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
