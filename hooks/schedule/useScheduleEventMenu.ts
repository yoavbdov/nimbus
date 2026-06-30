import { useCallback, useState, type MouseEvent } from "react";
import type { ScheduleEvent } from "@/lib/schedule-data";

function makeVirtualRef(x: number, y: number) {
  return {
    current: {
      getBoundingClientRect: (): DOMRect => ({
        x,
        y,
        top: y,
        left: x,
        right: x,
        bottom: y,
        width: 0,
        height: 0,
        toJSON: () => ({ x, y, top: y, left: x, right: x, bottom: y, width: 0, height: 0 }),
      }),
    },
  };
}

/**
 * Owns the click-to-open actions menu for a schedule event: which event is
 * active, where the menu is anchored, and the open state. The menu content
 * itself is chosen by the active event's category in the view layer.
 */
export function useScheduleEventMenu() {
  const [open, setOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<ScheduleEvent | null>(null);
  const [virtualRef, setVirtualRef] = useState(() => makeVirtualRef(0, 0));

  const openAt = useCallback((event: ScheduleEvent, e: MouseEvent) => {
    setActiveEvent(event);
    setVirtualRef(makeVirtualRef(e.clientX, e.clientY));
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setActiveEvent(null);
  }, []);

  const onSelect = useCallback(() => {
    setOpen(false);
    setActiveEvent(null);
  }, []);

  return { open, activeEvent, virtualRef, openAt, handleOpenChange, onSelect };
}
