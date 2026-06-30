import { useCallback, useState, type MouseEvent } from "react";
import type { ActivityAction } from "@/lib/activity-actions";

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

export function useActivityActionsMenu() {
  const [open, setOpen] = useState(false);
  const [virtualRef, setVirtualRef] = useState(() => makeVirtualRef(0, 0));

  const openAt = useCallback((e: MouseEvent) => {
    setVirtualRef(makeVirtualRef(e.clientX, e.clientY));
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const onSelect = useCallback((_action: ActivityAction) => {
    setOpen(false);
  }, []);

  return { open, setOpen, virtualRef, openAt, close, onSelect };
}
