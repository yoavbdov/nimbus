import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { leagueRanksByCategory, type LeagueCategory } from "@/lib/leagues-data";

// Color scales with rank importance within the category (low → high).
const tiers = [
  "bg-slate-500/15 text-slate-700 dark:text-slate-300 ring-1 ring-slate-500/30",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/30",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/30",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30",
];

export function LeagueRankBadge({
  category,
  rank,
}: {
  category: LeagueCategory;
  rank: string;
}) {
  const ranks = leagueRanksByCategory[category];
  const idx = ranks.indexOf(rank);
  const count = ranks.length;
  // Map this rank's position onto the top of the tier palette so the highest
  // rank always gets the strongest color regardless of how many ranks exist.
  const tier = tiers[tiers.length - count + Math.max(idx, 0)] ?? tiers[0];

  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium border-0",
        tier,
      )}
    >
      {rank}
    </Badge>
  );
}
