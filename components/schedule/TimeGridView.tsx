"use client";

import { useEffect, useMemo, useRef } from "react";
import { HEBREW_WEEKDAYS_SHORT, isSameDay } from "@/lib/calendar";
import {
  CATEGORY_META,
  layoutDayEvents,
  timeToMinutes,
  type ScheduleEvent,
} from "@/lib/schedule-data";
import { cn } from "@/lib/utils";

interface DayColumn {
  date: Date;
  iso: string;
  events: ScheduleEvent[];
}

interface TimeGridViewProps {
  days: DayColumn[];
  today: Date;
}

const HOUR_HEIGHT = 64; // px per hour — taller rows so event boxes breathe
const GUTTER = "3.5rem";
const DEFAULT_SCROLL_HOUR = 11; // first view lands at 11:00; scroll up/down for more

export function TimeGridView({ days, today }: TimeGridViewProps) {
  // The grid always renders the full 24-hour day so it can be scrolled to any
  // hour; the viewport just defaults to the morning so the first view is useful.
  const startHour = 0;
  const endHour = 24;

  const hours = useMemo(
    () => Array.from({ length: endHour - startHour }, (_, i) => startHour + i),
    [],
  );
  const bodyHeight = hours.length * HOUR_HEIGHT;

  // On mount, scroll down to the default morning hour so the user isn't staring
  // at the empty pre-dawn hours, while keeping 00:00 reachable.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = DEFAULT_SCROLL_HOUR * HOUR_HEIGHT;
    }
  }, []);

  // Columns always divide the full width equally: more days → thinner columns,
  // so every selected day stays visible without horizontal scrolling.
  const gridCols = `${GUTTER} repeat(${days.length}, minmax(0, 1fr))`;

  return (
    <div className="neu-inset overflow-hidden rounded-2xl">
      <div
        ref={scrollRef}
        className="players-scroll h-[calc(100vh-12rem)] min-h-96 overflow-y-auto"
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
                  className="flex flex-col items-center gap-0.5 border-s border-foreground/8 py-2"
                >
                  <span className="text-[0.65rem] text-muted-foreground/70">
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
}: {
  events: ScheduleEvent[];
  hours: number[];
  startHour: number;
}) {
  const positioned = useMemo(() => layoutDayEvents(events), [events]);

  return (
    <div className="relative border-s border-foreground/8">
      {/* Hour gridlines */}
      {hours.map((h) => (
        <div
          key={h}
          className="border-t border-foreground/6"
          style={{ height: HOUR_HEIGHT }}
        />
      ))}

      {/* Event blocks */}
      {positioned.map(({ event, lane, lanes }) => {
        const meta = CATEGORY_META[event.category];
        const startMin = timeToMinutes(event.start);
        const endMin = timeToMinutes(event.end);
        const top = ((startMin - startHour * 60) / 60) * HOUR_HEIGHT;
        const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 22);
        const widthPct = 100 / lanes;

        return (
          <div
            key={event.id}
            className="absolute flex flex-col gap-0.5 overflow-hidden rounded-lg px-2 py-1.5 text-[0.65rem] leading-tight text-white shadow-sm"
            style={{
              top: top + 1,
              height: height - 2,
              insetInlineStart: `calc(${lane * widthPct}% + 2px)`,
              width: `calc(${widthPct}% - 4px)`,
              backgroundColor: meta.color,
            }}
            title={`${event.start}–${event.end} · ${event.title}`}
          >
            <p className="truncate font-semibold text-white">{event.title}</p>
            {/* dir=ltr keeps the range as start–end inside the RTL layout */}
            <p dir="ltr" className="num text-white/90">
              {event.start}–{event.end}
            </p>
            {height > 56 && (
              <p className="truncate text-white/85">{event.coach}</p>
            )}
            {height > 74 && (
              <p className="truncate text-white/75">{event.location}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
