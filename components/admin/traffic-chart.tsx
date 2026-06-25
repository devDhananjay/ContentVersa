export function TrafficChart({
  weeks,
}: {
  weeks: { label: string; value: number }[];
}) {
  const max = Math.max(...weeks.map((w) => w.value), 1);

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="font-display text-xl font-bold mb-6">Traffic by week</h2>
      {weeks.every((w) => w.value === 0) ? (
        <p className="text-sm text-muted-foreground py-16 text-center">
          No visitor data yet — traffic will appear as users browse the site.
        </p>
      ) : (
        <div className="h-72 grid grid-cols-12 gap-2 items-end px-2">
          {weeks.map((week) => {
            const h = Math.max(8, Math.round((week.value / max) * 100));
            return (
              <div key={week.label} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground mb-1">{week.value}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-neon-blue via-neon-purple to-neon-pink min-h-[8px]"
                  style={{ height: `${h}%` }}
                  title={`${week.label}: ${week.value} active visitors`}
                />
                <span className="text-[10px] text-muted-foreground">{week.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
