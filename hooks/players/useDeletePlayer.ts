import { useCallback, useMemo, useState } from "react";
import { deletePlayer } from "@/lib/firebase/data/players";

/** A player the modal can delete: its Firestore id plus its display name. */
export interface DeletablePlayer {
  id: string;
  name: string;
}

/**
 * Owns the state for the "delete player(s)" confirmation modal. Deleting is
 * permanent, so the user must type a confirmation phrase before the אישור
 * button is enabled:
 *   - one player  → the player's full name.
 *   - many players → "אני מעוניין למחוק N שחקנים".
 *
 * Works off player names so any table (the full players list or the dashboard
 * rating table) can drive it. The modal stays presentational.
 */
export function useDeletePlayer() {
  const [open, setOpen] = useState(false);
  const [targets, setTargets] = useState<DeletablePlayer[]>([]);
  const [confirmText, setConfirmText] = useState("");

  const names = useMemo(() => targets.map((t) => t.name), [targets]);

  // The exact text the user has to type to enable the delete button.
  const expectedPhrase =
    targets.length > 1
      ? `אני מעוניין למחוק ${targets.length} שחקנים`
      : (names[0] ?? "");

  const valid = targets.length > 0 && confirmText.trim() === expectedPhrase;

  const openFor = useCallback((players: DeletablePlayer[]) => {
    setTargets(players);
    setConfirmText("");
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const confirm = useCallback(() => {
    if (!valid) return;
    for (const target of targets) void deletePlayer(target.id);
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
