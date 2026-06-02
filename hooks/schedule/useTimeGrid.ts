import { useEffect, useMemo, useRef } from "react";
import { layoutDayEvents, type ScheduleEvent } from "@/lib/schedule-data";

export const HOUR_HEIGHT = 64; // px per hour — taller rows so event boxes breathe
export const GUTTER = "3.5rem";
export const START_HOUR = 0;
export const END_HOUR = 24;
const DEFAULT_SCROLL_HOUR = 11; // first view lands at 11:00; scroll up/down for more

/**
 * Owns the time-grid geometry and the mount-time scroll: the grid always renders
 * the full 24-hour day so it can be scrolled to any hour, while the viewport
 * defaults to the morning so the first view is useful.
 */
export function useTimeGrid(dayCount: number) {
  const hours = useMemo(
    () => Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i),
    [],
  );
  const bodyHeight = hours.length * HOUR_HEIGHT;

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = DEFAULT_SCROLL_HOUR * HOUR_HEIGHT;
    }
  }, []);

  // Columns always divide the full width equally: more days → thinner columns,
  // so every selected day stays visible without horizontal scrolling.
  const gridCols = `${GUTTER} repeat(${dayCount}, minmax(0, 1fr))`;

  return { hours, bodyHeight, scrollRef, gridCols, startHour: START_HOUR };
}

/** Resolves overlapping events in a single day column into positioned lanes. */
export function useDayLayout(events: ScheduleEvent[]) {
  return useMemo(() => layoutDayEvents(events), [events]);
}
