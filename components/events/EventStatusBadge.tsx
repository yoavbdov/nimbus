import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EventStatus } from "@/lib/events-data";

const styles: Record<EventStatus, string> = {
  "פעיל":
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30",
  "מתוכנן":
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30",
  "הסתיים":
    "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30",
  "ללא פעילות":
    "bg-gray-400/15 text-gray-600 dark:text-gray-400 ring-1 ring-gray-400/30",
  "ארכיון":
    "bg-slate-500/15 text-slate-700 dark:text-slate-300 ring-1 ring-slate-500/30",
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
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
