import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CoachStatus } from "@/lib/coaches-data";

const styles: Record<CoachStatus, string> = {
  "פעיל":
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30",
  "מחליף":
    "bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/30",
  "לא פעיל":
    "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30",
};

export function CoachStatusBadge({ status }: { status: CoachStatus }) {
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
