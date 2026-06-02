"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMonthTitle } from "@/lib/calendar";

interface MonthNavProps {
  viewMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function MonthNav({
  viewMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
}: MonthNavProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      {/* RTL: "today" on the right (start), the month stepper on the left (end). */}
      <Button
        type="button"
        variant="ghost"
        onClick={onToday}
        className={cn(
          "group/btn relative overflow-hidden tint-indigo",
          "h-8 rounded-xl px-3 text-xs font-medium neu-raised-xs neu-interactive",
        )}
      >
        <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
        השבוע
      </Button>

      <div className="flex items-center gap-1.5">
        {/* RTL: "previous" sits on the right, so ChevronRight goes back. */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevMonth}
          aria-label="חודש קודם"
          className="size-7 rounded-lg neu-raised-xs neu-interactive"
        >
          <ChevronRight className="size-3.5" />
        </Button>
        <h2 className="num w-24 shrink-0 overflow-hidden whitespace-nowrap text-center text-xs font-semibold tracking-tight tint-text">
          {formatMonthTitle(viewMonth)}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          aria-label="חודש הבא"
          className="size-7 rounded-lg neu-raised-xs neu-interactive"
        >
          <ChevronLeft className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
