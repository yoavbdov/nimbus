"use client";

import { isSameDay, toISODate } from "@/lib/calendar";
import type { ScheduleEvent } from "@/lib/schedule-data";
import { cn } from "@/lib/utils";

interface CalendarDayCellProps {
  day: Date;
  today: Date;
  /** True for days that belong to the previous/next month (shown dimmed). */
  outside?: boolean;
  events: ScheduleEvent[];
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  onSelectStart: (iso: string) => void;
  onSelectEnter: (iso: string) => void;
}

/** A single compact day button in the calendar picker. */
export function CalendarDayCell({
  day,
  today,
  outside = false,
  events,
  selected,
  rangeStart,
  rangeEnd,
  onSelectStart,
  onSelectEnter,
}: CalendarDayCellProps) {
  const iso = toISODate(day);
  const isToday = isSameDay(day, today);
  const hasEvents = events.length > 0;

  return (
    <button
      type="button"
      role="gridcell"
      aria-selected={selected}
      onMouseDown={(e) => {
        e.preventDefault(); // avoid text selection while dragging
        onSelectStart(iso);
      }}
      onMouseEnter={() => onSelectEnter(iso)}
      className={cn(
        "relative flex h-6 select-none items-center justify-center text-[0.7rem] transition-colors duration-100",
        selected ? "bg-primary/15 text-foreground" : "hover:bg-foreground/5",
        outside && !selected && "opacity-40",
        rangeStart && "rounded-s-md",
        rangeEnd && "rounded-e-md",
      )}
    >
      <span
        className={cn(
          "num flex size-4.5 items-center justify-center rounded-full leading-none transition-colors",
          isToday && "bg-primary font-semibold text-primary-foreground shadow-sm",
          !isToday && selected && "font-medium",
          !isToday && !selected && outside && "text-muted-foreground",
        )}
      >
        {day.getDate()}
      </span>

      {/* A subtle dot marks days that have sessions. */}
      {hasEvents && !isToday && (
        <span className="absolute bottom-0.5 size-1 rounded-full bg-primary/60" />
      )}
    </button>
  );
}
