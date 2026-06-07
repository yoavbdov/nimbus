import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles = {
  updated:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30",
  notUpdated:
    "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30",
};

export function RatingUpdatedBadge({ updated }: { updated: boolean }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium border-0",
        updated ? styles.updated : styles.notUpdated,
      )}
    >
      {updated ? "עודכן" : "לא עודכן"}
    </Badge>
  );
}
