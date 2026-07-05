import { useCallback, useRef, useState } from "react";

/** Extra info for the archive dialog: which rows, and what to run on confirm. */
interface ArchiveOptions {
  /** Names of the rows being archived — shown in the dialog. */
  names?: string[];
  /** Performs the actual archive (e.g. flips the Firestore status). */
  onConfirm?: () => void;
}

/**
 * Drives the "move to archive" confirmation dialog. Holds the open state, how
 * many rows are being archived, their names, and the archive action to run on
 * confirm (wired by each module — e.g. courses flip the Firestore status).
 */
export function useArchiveConfirm() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [names, setNames] = useState<string[]>([]);
  const onConfirmRef = useRef<(() => void) | null>(null);

  const openFor = useCallback((n: number, opts?: ArchiveOptions) => {
    setCount(n);
    setNames(opts?.names ?? []);
    onConfirmRef.current = opts?.onConfirm ?? null;
    setOpen(true);
  }, []);

  const cancel = useCallback(() => {
    onConfirmRef.current = null;
    setOpen(false);
  }, []);

  const confirm = useCallback(() => {
    onConfirmRef.current?.();
    onConfirmRef.current = null;
    setOpen(false);
  }, []);

  return { open, count, names, openFor, cancel, confirm };
}
