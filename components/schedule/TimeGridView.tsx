"use client";

import { motion } from "framer-motion";
import { HEBREW_WEEKDAYS_SHORT, isSameDay } from "@/lib/calendar";
import {
  CATEGORY_META,
  timeToMinutes,
  type ScheduleEvent,
} from "@/lib/schedule-data";
import {
  HOUR_HEIGHT,
  useDayLayout,
  useTimeGrid,
} from "@/hooks/schedule/useTimeGrid";
import { cn } from "@/lib/utils";

interface DayColumn {
  date: Date;
  iso: string;
  events: ScheduleEvent[];
}

interface TimeGridViewProps {
  days: DayColumn[];
  today: Date;
  onEventClick: (event: ScheduleEvent, e: React.MouseEvent) => void;
}

export function TimeGridView({ days, today, onEventClick }: TimeGridViewProps) {
  const { hours, bodyHeight, scrollRef, gridCols, startHour, nowMinutes } =
    useTimeGrid(days.length);

  return (
    <div className="neu-inset h-full overflow-hidden rounded-2xl">
      <div
        ref={scrollRef}
        className="players-scroll h-full min-h-96 overflow-y-auto"
      >
        <div>
          {/* Sticky day header */}
          <div
            className="sticky top-0 z-20 grid border-b border-foreground/8 bg-card/80 backdrop-blur-sm"
            style={{ gridTemplateColumns: gridCols }}
          >
            <div /> {/* gutter spacer */}
            {days.map((day) => {
              const isToday = isSameDay(day.date, today);
              return (
                <div
                  key={day.iso}
                  className={cn(
                    "flex flex-col items-center gap-0.5 border-s border-foreground/8 py-2",
                    isToday && "bg-primary/4",
                  )}
                >
                  <span
                    className={cn(
                      "text-[0.65rem]",
                      isToday
                        ? "font-medium text-primary/80"
                        : "text-muted-foreground/70",
                    )}
                  >
                    {HEBREW_WEEKDAYS_SHORT[day.date.getDay()]}
                  </span>
                  <span
                    className={cn(
                      "num flex size-7 items-center justify-center rounded-full text-sm",
                      isToday
                        ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                        : "text-foreground/85",
                    )}
                  >
                    {day.date.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time body */}
          <div className="grid" style={{ gridTemplateColumns: gridCols }}>
            {/* Hour gutter */}
            <div className="relative" style={{ height: bodyHeight }}>
              {hours.map((h) => (
                <div
                  key={h}
                  className="num absolute -translate-y-1/2 pe-2 text-end text-[0.65rem] text-muted-foreground/60"
                  style={{
                    top: (h - startHour) * HOUR_HEIGHT,
                    insetInlineEnd: 0,
                  }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day) => (
              <DayColumnBody
                key={day.iso}
                events={day.events}
                hours={hours}
                startHour={startHour}
                isToday={isSameDay(day.date, today)}
                nowMinutes={nowMinutes}
                onEventClick={onEventClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DayColumnBody({
  events,
  hours,
  startHour,
  isToday,
  nowMinutes,
  onEventClick,
}: {
  events: ScheduleEvent[];
  hours: number[];
  startHour: number;
  isToday: boolean;
  nowMinutes: number;
  onEventClick: (event: ScheduleEvent, e: React.MouseEvent) => void;
}) {
  const positioned = useDayLayout(events);
  const nowTop = ((nowMinutes - startHour * 60) / 60) * HOUR_HEIGHT;

  return (
    <div
      className={cn(
        "relative border-s border-foreground/8",
        isToday && "bg-primary/4",
      )}
    >
      {/* Hour gridlines — full hour solid, half hour as a faint dashed line. */}
      {hours.map((h) => (
        <div
          key={h}
          className="relative border-t border-foreground/8"
          style={{ height: HOUR_HEIGHT }}
        >
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-foreground/5" />
        </div>
      ))}

      {/* Current-time indicator — only on today's column. */}
      {isToday && (
        <div
          className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
          style={{ top: nowTop }}
        >
          <span className="size-1.5 rounded-full bg-rose-500 shadow-sm" />
          <span className="h-px flex-1 bg-rose-500/70" />
        </div>
      )}

      {/* Event blocks — light tinted fill with a coloured accent bar and dark
          text, for high readability against the neumorphic surface. */}
      {positioned.map(({ event, lane, lanes }, i) => {
        const meta = CATEGORY_META[event.category];
        const startMin = timeToMinutes(event.start);
        const endMin = timeToMinutes(event.end);
        const top = ((startMin - startHour * 60) / 60) * HOUR_HEIGHT;
        const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 22);
        const widthPct = 100 / lanes;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.25,
              delay: Math.min(i * 0.03, 0.3),
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(ev) => onEventClick(event, ev)}
            className="group/event absolute flex cursor-pointer flex-col gap-0.5 overflow-hidden rounded-lg px-2 py-1 text-[0.65rem] leading-tight shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
            style={{
              top: top + 1,
              height: height - 2,
              insetInlineStart: `calc(${lane * widthPct}% + 2px)`,
              width: `calc(${widthPct}% - 4px)`,
              backgroundColor: meta.soft,
              borderTop: `3px solid ${meta.color}`,
              borderBottom: `3px solid ${meta.color}`,
            }}
            title={`${event.start}–${event.end} · ${event.title}`}
          >
            <p className="truncate font-semibold text-foreground">
              {event.title}
            </p>
            {/* dir=ltr keeps the range as start–end inside the RTL layout */}
            <p dir="ltr" className="num text-foreground/70">
              {event.start}–{event.end}
            </p>
            {height > 56 && (
              <p className="truncate text-foreground/70">{event.coach}</p>
            )}
            {height > 74 && (
              <p className="truncate text-foreground/55">{event.location}</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
