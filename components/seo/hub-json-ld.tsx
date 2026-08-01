/** Renders one or more JSON-LD script blocks for hub SEO. */
export function HubJsonLd({ blocks }: { blocks: unknown[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
