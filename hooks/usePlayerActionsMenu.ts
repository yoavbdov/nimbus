import { useCallback, useMemo, useState, type MouseEvent } from "react";
import type { PlayerAction } from "@/lib/player-actions";

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

export function usePlayerActionsMenu() {
  const [open, setOpen] = useState(false);
  const [virtualRef, setVirtualRef] = useState(() => makeVirtualRef(0, 0));

  const openAt = useCallback((e: MouseEvent) => {
    const next = makeVirtualRef(e.clientX, e.clientY);
    setVirtualRef(next);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const onSelect = useCallback((_action: PlayerAction) => {
    setOpen(false);
  }, []);

  const popoverProps = useMemo(
    () => ({ open, onOpenChange: setOpen }),
    [open],
  );

  return { open, setOpen, virtualRef, openAt, close, onSelect, popoverProps };
}
