import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TournamentStatus } from "@/lib/tournaments-data";

const styles: Record<TournamentStatus, string> = {
  "פעילה":
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30",
  "מתוכננת":
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30",
  "הסתיימה":
    "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30",
};

export function TournamentStatusBadge({ status }: { status: TournamentStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium border-0",
        styles[status],
      )}
    >
      {status}
    </Badge>
  );
}
