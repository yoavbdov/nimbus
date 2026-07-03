import { useCallback, useMemo, useState } from "react";
import { deleteCoach } from "@/lib/firebase/data/coaches";

/** A coach the modal can delete: its Firestore id plus its display name. */
export interface DeletableCoach {
  id: string;
  name: string;
}

/**
 * Owns the state for the "delete coach(es)" confirmation modal. Deleting is
 * permanent, so the user must type a confirmation phrase before the אישור
 * button is enabled:
 *   - one coach  → the coach's full name.
 *   - many coaches → "אני מעוניין למחוק N מדריכים".
 *
 * Works off id+name targets so the delete can hit Firestore by id while the
 * modal still shows names. The modal stays presentational.
 */
export function useDeleteCoach() {
  const [open, setOpen] = useState(false);
  const [targets, setTargets] = useState<DeletableCoach[]>([]);
  const [confirmText, setConfirmText] = useState("");

  const names = useMemo(() => targets.map((t) => t.name), [targets]);

  // The exact text the user has to type to enable the delete button.
  const expectedPhrase =
    targets.length > 1
      ? `אני מעוניין למחוק ${targets.length} מדריכים`
      : (names[0] ?? "");

  const valid = targets.length > 0 && confirmText.trim() === expectedPhrase;

  const openFor = useCallback((coaches: DeletableCoach[]) => {
    setTargets(coaches);
    setConfirmText("");
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const confirm = useCallback(() => {
    if (!valid) return;
    for (const target of targets) void deleteCoach(target.id);
    setOpen(false);
  }, [valid, targets]);

  return {
    open,
    names,
    confirmText,
    setConfirmText,
    expectedPhrase,
    valid,
    openFor,
    handleOpenChange,
    confirm,
  };
}
