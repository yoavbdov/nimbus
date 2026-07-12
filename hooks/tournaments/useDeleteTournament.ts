import { useCallback, useMemo, useState } from "react";
import { deleteTournamentCascade } from "@/lib/firebase/data/tournaments";

/** A tournament the modal can delete: its Firestore id plus its display name. */
export interface DeletableTournament {
  id: string;
  name: string;
}

/**
 * Owns the state for the "delete tournament(s)" confirmation modal. Deleting is
 * permanent and also drops the tournament's rounds (sessions) and every
 * relation pointing at it, so the user must type a confirmation phrase first:
 *   - one tournament  → the tournament's name.
 *   - many tournaments → "אני מעוניין למחוק N תחרויות".
 */
export function useDeleteTournament() {
  const [open, setOpen] = useState(false);
  const [targets, setTargets] = useState<DeletableTournament[]>([]);
  const [confirmText, setConfirmText] = useState("");

  const names = useMemo(() => targets.map((t) => t.name), [targets]);

  const expectedPhrase =
    targets.length > 1
      ? `אני מעוניין למחוק ${targets.length} תחרויות`
      : (names[0] ?? "");

  const valid = targets.length > 0 && confirmText.trim() === expectedPhrase;

  const openFor = useCallback((tournaments: DeletableTournament[]) => {
    setTargets(tournaments);
    setConfirmText("");
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const confirm = useCallback(() => {
    if (!valid) return;
    for (const target of targets) void deleteTournamentCascade(target.id);
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
