import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { slugify } from "@/lib/utils";
import { splitMarkdownEmbeds } from "@/lib/youtube";
import { YouTubeEmbed } from "@/components/blog/youtube-embed";

const markdownComponents = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 id={slugify(String(children))} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 id={slugify(String(children))} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 id={slugify(String(children))} {...props}>
      {children}
    </h3>
  ),
};

function MarkdownChunk({ content }: { content: string }) {
  const trimmed = content.trim();
  if (!trimmed) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={markdownComponents}
    >
      {trimmed}
    </ReactMarkdown>
  );
}

export function renderMarkdown(content: string) {
  const parts = splitMarkdownEmbeds(content);

  return (
    <article className="prose-content">
      {parts.map((part, i) =>
        part.type === "youtube" ? (
          <YouTubeEmbed key={`yt-${i}-${part.src}`} src={part.src} />
        ) : (
          <MarkdownChunk key={`md-${i}`} content={part.value} />
        )
      )}
    </article>
  );
}

export function extractTOC(content: string) {
  const items: { id: string; text: string; level: number }[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const match = /^(#{2,3})\s+(.+)/.exec(line.trim());
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      items.push({ id: slugify(text), text, level });
    }
  }
  return items;
}
