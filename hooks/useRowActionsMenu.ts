import { useCallback, useState, type MouseEvent } from "react";
import type { RowAction } from "@/components/shared/RowActionsMenu";

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

export function useRowActionsMenu() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [virtualRef, setVirtualRef] = useState(() => makeVirtualRef(0, 0));

  const openAt = useCallback((id: string, e: MouseEvent) => {
    setActiveId(id);
    setVirtualRef(makeVirtualRef(e.clientX, e.clientY));
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setActiveId(null);
  }, []);

  const onSelect = useCallback((_action: RowAction) => {
    setOpen(false);
    setActiveId(null);
  }, []);

  return { open, activeId, virtualRef, openAt, handleOpenChange, onSelect };
}
