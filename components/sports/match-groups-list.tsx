import { MatchCard } from "@/components/sports/match-card";
import type { MatchGroup } from "@/lib/sports/types";

interface MatchGroupsListProps {
  groups: MatchGroup[];
  emptyMessage?: string;
}

export function MatchGroupsList({
  groups,
  emptyMessage = "No matches available.",
}: MatchGroupsListProps) {
  if (!groups.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.dateLabel}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
            {group.dateLabel}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.matches.map((match) => (
              <MatchCard key={match.id} match={match} compact />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
