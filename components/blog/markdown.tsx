import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { createHeadingIdAllocator } from "@/lib/utils";
import { splitMarkdownEmbeds } from "@/lib/youtube";
import { YouTubeEmbed } from "@/components/blog/youtube-embed";
import { InlinePollEmbed } from "@/components/blog/inline-poll-embed";

function makeHeading(
  Tag: "h1" | "h2" | "h3",
  idFor: (text: string) => string
) {
  return function Heading({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) {
    const text = String(children);
    return (
      <Tag id={idFor(text)} {...props}>
        {children}
      </Tag>
    );
  };
}

function MarkdownChunk({
  content,
  idFor,
}: {
  content: string;
  idFor: (text: string) => string;
}) {
  const trimmed = content.trim();
  if (!trimmed) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        h1: makeHeading("h1", idFor),
        h2: makeHeading("h2", idFor),
        h3: makeHeading("h3", idFor),
      }}
    >
      {trimmed}
    </ReactMarkdown>
  );
}

export function renderMarkdown(content: string) {
  const idFor = createHeadingIdAllocator();
  const parts = splitMarkdownEmbeds(content);

  return (
    <article className="prose-content">
      {parts.map((part, i) => {
        if (part.type === "youtube") {
          return <YouTubeEmbed key={`yt-${i}-${part.src}`} src={part.src} />;
        }
        if (part.type === "poll") {
          return <InlinePollEmbed key={`poll-${i}`} body={part.body} />;
        }
        return (
          <MarkdownChunk key={`md-${i}`} content={part.value} idFor={idFor} />
        );
      })}
    </article>
  );
}

export function extractTOC(content: string) {
  const idFor = createHeadingIdAllocator();
  const items: { id: string; text: string; level: number }[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const match = /^(#{2,3})\s+(.+)/.exec(line.trim());
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      items.push({ id: idFor(text), text, level });
    }
  }
  return items;
}
