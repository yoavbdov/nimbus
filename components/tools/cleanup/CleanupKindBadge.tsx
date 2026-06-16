import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type CompletedKind } from "@/lib/cleanup-data";

const kindClass: Record<CompletedKind, string> = {
  חוג: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
  אירוע: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  תחרות: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
};

export function CleanupKindBadge({ kind }: { kind: CompletedKind }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full border-0 px-2.5 py-0.5 text-[0.65rem] font-medium",
        kindClass[kind],
      )}
    >
      {kind}
    </Badge>
  );
}
