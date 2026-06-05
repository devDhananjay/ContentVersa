function buildPath(values: number[], width = 800, height = 200): string {
  if (values.length === 0) return `M0,${height} L${width},${height}`;
  const max = Math.max(...values, 1);
  return values
    .map((v, i) => {
      const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * width;
      const y = height - (v / max) * (height - 24) - 12;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function ViewsAreaChart({
  values,
  className = "h-64",
}: {
  values: number[];
  className?: string;
}) {
  const line = buildPath(values);
  const area = `${line} L800,250 L0,250 Z`;
  const hasData = values.some((v) => v > 0);

  return (
    <div className={`rounded-xl bg-gradient-to-br from-neon-blue/5 via-neon-purple/5 to-neon-pink/5 border relative overflow-hidden ${className}`}>
      {hasData ? (
        <svg viewBox="0 0 800 250" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="viewsChartFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#viewsChartFill)" />
          <path d={line} fill="none" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Views will appear as readers open your posts
        </div>
      )}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-xs text-muted-foreground">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

export function ViewsBarChart({
  values,
  className = "h-64",
}: {
  values: number[];
  className?: string;
}) {
  const max = Math.max(...values, 1);
  const bars = values.length > 0 ? values : Array(12).fill(0);

  return (
    <div className={`grid grid-cols-12 gap-2 items-end px-2 ${className}`}>
      {bars.slice(-12).map((v, i) => {
        const h = Math.max(8, Math.round((v / max) * 100));
        return (
          <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-neon-blue via-neon-purple to-neon-pink min-h-[8px]"
              style={{ height: `${h}%` }}
              title={`${v} views`}
            />
            <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
          </div>
        );
      })}
    </div>
  );
}
