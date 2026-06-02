"use client";

import { CalendarDayCell } from "@/components/schedule/CalendarDayCell";
import { HEBREW_WEEKDAYS_SHORT, isSameMonth, toISODate } from "@/lib/calendar";
import type { DayRange } from "@/hooks/schedule/useScheduleCalendar";
import type { ScheduleEvent } from "@/lib/schedule-data";

interface CalendarGridProps {
  monthGrid: Date[];
  viewMonth: Date;
  today: Date;
  activeRange: DayRange;
  eventsByDay: Map<string, ScheduleEvent[]>;
  isSelected: (iso: string) => boolean;
  onSelectStart: (iso: string) => void;
  onSelectEnter: (iso: string) => void;
}

const EMPTY: ScheduleEvent[] = [];

export function CalendarGrid({
  monthGrid,
  viewMonth,
  today,
  activeRange,
  eventsByDay,
  isSelected,
  onSelectStart,
  onSelectEnter,
}: CalendarGridProps) {
  // Trim the 6-week grid to the last week that contains a day of this month —
  // so the final week is completed with the next month's days (dimmed), but no
  // extra all-next-month week is shown.
  const lastInMonth = monthGrid.reduce(
    (last, day, i) => (isSameMonth(day, viewMonth) ? i : last),
    0,
  );
  const visibleDays = monthGrid.slice(0, Math.ceil((lastInMonth + 1) / 7) * 7);

  return (
    <div className="neu-inset w-full rounded-xl p-1.5">
      {/* Weekday header */}
      <div className="grid grid-cols-7">
        {HEBREW_WEEKDAYS_SHORT.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[0.55rem] font-medium tracking-wider text-muted-foreground/60 uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells — the leading/trailing days that belong to the neighbouring
          months are still shown, just dimmed, so the grid never has gaps. */}
      <div role="grid" className="grid grid-cols-7 gap-0.5">
        {visibleDays.map((day) => {
          const iso = toISODate(day);
          return (
            <CalendarDayCell
              key={iso}
              day={day}
              today={today}
              outside={!isSameMonth(day, viewMonth)}
              events={eventsByDay.get(iso) ?? EMPTY}
              selected={isSelected(iso)}
              rangeStart={iso === activeRange.start}
              rangeEnd={iso === activeRange.end}
              onSelectStart={onSelectStart}
              onSelectEnter={onSelectEnter}
            />
          );
        })}
      </div>
    </div>
  );
}
