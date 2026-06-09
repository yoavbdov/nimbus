import { useCallback, useState } from "react";

/**
 * Owns the state for the "delete coach(es)" confirmation modal. Deleting is
 * permanent, so the user must type a confirmation phrase before the אישור
 * button is enabled:
 *   - one coach  → the coach's full name.
 *   - many coaches → "אני מעוניין למחוק N מדריכים".
 *
 * Works off coach names so the table can drive it. The modal stays
 * presentational.
 */
export function useDeleteCoach() {
  const [open, setOpen] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const [confirmText, setConfirmText] = useState("");

  // The exact text the user has to type to enable the delete button.
  const expectedPhrase =
    names.length > 1
      ? `אני מעוניין למחוק ${names.length} מדריכים`
      : (names[0] ?? "");

  const valid = names.length > 0 && confirmText.trim() === expectedPhrase;

  const openFor = useCallback((coachNames: string[]) => {
    setNames(coachNames);
    setConfirmText("");
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const confirm = useCallback(() => {
    if (!valid) return;
    // UI only for now — the actual delete is wired up elsewhere later.
  }, [valid]);

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
