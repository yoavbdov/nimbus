import { useCallback, useState } from "react";

/**
 * Drives the "move to archive" confirmation dialog. Holds the open state and
 * how many rows are being archived. The actual release of coach / room /
 * equipment and the move to the archive is wired to the backend later.
 */
export function useArchiveConfirm() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  const openFor = useCallback((n: number) => {
    setCount(n);
    setOpen(true);
  }, []);

  const cancel = useCallback(() => setOpen(false), []);

  const confirm = useCallback(() => {
    // TODO: release the assigned coach, room and equipment, then move the
    // selected rows to the archive once the backend / DB is in place.
    setOpen(false);
  }, []);

  return { open, count, openFor, cancel, confirm };
}
