import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SUPPORT_STATUS_LABELS,
  type SupportStatus,
} from "@/lib/support-form";

const styles: Record<SupportStatus, string> = {
  new: "bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/30",
  in_progress:
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30",
  closed: "bg-foreground/10 text-foreground/60 ring-1 ring-foreground/15",
};

export function SupportStatusBadge({ status }: { status: SupportStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium border-0",
        styles[status],
      )}
    >
      {SUPPORT_STATUS_LABELS[status]}
    </Badge>
  );
}
