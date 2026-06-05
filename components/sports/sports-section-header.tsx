interface SportsSectionHeaderProps {
  eyebrow: string;
  title: string;
  highlight?: string;
}

export function SportsSectionHeader({
  eyebrow,
  title,
  highlight,
}: SportsSectionHeaderProps) {
  return (
    <div className="mb-4">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-neon-cyan">
        {eyebrow}
      </span>
      <h2 className="font-display text-xl font-extrabold tracking-tight mt-0.5">
        {title}{" "}
        {highlight && <span className="text-gradient">{highlight}</span>}
      </h2>
    </div>
  );
}
