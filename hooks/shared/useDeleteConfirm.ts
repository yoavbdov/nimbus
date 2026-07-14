import { useCallback, useMemo, useState } from "react";

/** A row the delete dialog can act on: its Firestore id plus its display name. */
export interface DeletableItem {
  id: string;
  name: string;
}

/**
 * Owns the state for a "delete row(s)" confirmation dialog. Deleting is
 * permanent, so the user must type a confirmation phrase before the delete
 * button is enabled:
 *   - one row   → the row's name.
 *   - many rows → "אני מעוניין למחוק N {noun}".
 *
 * Works off id+name targets so the delete hits Firestore by id while the dialog
 * shows names. Pass the entity's Firestore delete function and its plural noun;
 * the live table re-renders from its onSnapshot subscription once docs are gone.
 */
export function useDeleteConfirm(
  remove: (id: string) => Promise<void>,
  noun: string,
) {
  const [open, setOpen] = useState(false);
  const [targets, setTargets] = useState<DeletableItem[]>([]);
  const [confirmText, setConfirmText] = useState("");

  const names = useMemo(() => targets.map((t) => t.name), [targets]);

  // The exact text the user has to type to enable the delete button.
  const expectedPhrase =
    targets.length > 1
      ? `אני מעוניין למחוק ${targets.length} ${noun}`
      : (names[0] ?? "");

  const valid = targets.length > 0 && confirmText.trim() === expectedPhrase;

  const openFor = useCallback((items: DeletableItem[]) => {
    if (items.length === 0) return;
    setTargets(items);
    setConfirmText("");
    setOpen(true);
  }, []);

  const cancel = useCallback(() => setOpen(false), []);

  const confirm = useCallback(() => {
    if (!valid) return;
    for (const target of targets) void remove(target.id);
    setOpen(false);
  }, [valid, targets, remove]);

  return {
    open,
    names,
    count: targets.length,
    expectedPhrase,
    confirmText,
    setConfirmText,
    valid,
    openFor,
    cancel,
    confirm,
  };
}
