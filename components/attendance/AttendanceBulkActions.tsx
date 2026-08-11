"use client";

import { CheckCheck, XOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AttendanceBulkActionsProps {
  counts: { present: number; absent: number; unset: number; total: number };
  /** When true (archived course) the fill buttons are disabled. */
  readOnly?: boolean;
  onMarkAllPresent: () => void;
  onMarkAllAbsent: () => void;
}

function CountStat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="neu-inset rounded-xl px-3 py-2.5 flex flex-col items-center gap-1">
      <span className={cn("text-xl font-semibold num leading-none", className)}>
        {value}
      </span>
      <span className="text-xs text-foreground/60">{label}</span>
    </div>
  );
}

export function AttendanceBulkActions({
  counts,
  readOnly = false,
  onMarkAllPresent,
  onMarkAllAbsent,
}: AttendanceBulkActionsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <CountStat
          label="נכחו"
          value={counts.present}
          className="text-emerald-600 dark:text-emerald-400"
        />
        <CountStat
          label="לא נכחו"
          value={counts.absent}
          className="text-rose-600 dark:text-rose-400"
        />
        <CountStat
          label="לא הוזן"
          value={counts.unset}
          className="text-amber-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="ghost"
          disabled={readOnly}
          onClick={onMarkAllPresent}
          className="w-full h-10 gap-2 rounded-xl text-sm font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <CheckCheck className="size-4" />
          כולם נכחו
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={readOnly}
          onClick={onMarkAllAbsent}
          className="w-full h-10 gap-2 rounded-xl text-sm font-medium bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30 hover:bg-rose-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <XOctagon className="size-4" />
          כולם לא נכחו
        </Button>
      </div>
    </div>
  );
}
