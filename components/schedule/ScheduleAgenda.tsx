"use client";

import { motion } from "framer-motion";
import {
  fromISODate,
  formatDayLong,
  formatDayShort,
  isSameDay,
} from "@/lib/calendar";
import { CATEGORY_META, type ScheduleEvent } from "@/lib/schedule-data";
import { cn } from "@/lib/utils";

interface ScheduleAgendaProps {
  /** Flat, time-sorted list of every event in the selected range. */
  events: ScheduleEvent[];
  today: Date;
  rangeStart: Date;
  rangeEnd: Date;
}

/**
 * A scannable text agenda of the selected range — sessions grouped by day and
 * ordered by time, complementing the graphical time-grid. Purely presentational:
 * the day grouping is derived inline from the already-sorted `events`.
 */
export function ScheduleAgenda({
  events,
  today,
  rangeStart,
  rangeEnd,
}: ScheduleAgendaProps) {
  // Group the pre-sorted events by their ISO day, preserving time order.
  const groups: { iso: string; date: Date; items: ScheduleEvent[] }[] = [];
  for (const event of events) {
    let group = groups.at(-1);
    if (!group || group.iso !== event.date) {
      group = { iso: event.date, date: fromISODate(event.date), items: [] };
      groups.push(group);
    }
    group.items.push(event);
  }

  return (
    <div className="neu-inset mt-3 mb-6 flex min-h-0 flex-1 flex-col rounded-xl p-3">
      <h3 className="mb-2 text-sm font-bold tracking-tight tint-text">
        מפגשים בין {formatDayShort(rangeStart)} - {formatDayShort(rangeEnd)}
      </h3>

      {groups.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground/60">
          אין מפגשים בטווח הנבחר
        </p>
      ) : (
        <div className="players-scroll min-h-0 flex-1 space-y-3 overflow-y-auto pe-1">
          {groups.map((group) => (
            <div key={group.iso} className="space-y-1.5">
              <p
                className={cn(
                  "text-[0.7rem] font-semibold",
                  isSameDay(group.date, today)
                    ? "text-primary"
                    : "text-foreground/80",
                )}
              >
                {formatDayLong(group.date)}
              </p>

              <ul className="space-y-1">
                {group.items.map((event, i) => {
                  const meta = CATEGORY_META[event.category];
                  return (
                    <motion.li
                      key={event.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: Math.min(i * 0.04, 0.4),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span
                        dir="ltr"
                        className="num shrink-0 text-muted-foreground/70"
                      >
                        {event.start}
                      </span>
                      <span className="truncate text-foreground/85">
                        {event.title}
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
