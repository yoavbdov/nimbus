import { useCallback, useMemo, useState } from "react";
import {
  availableTournamentsFor,
  registeredTournamentsFor,
} from "@/lib/tournament-registration";

interface OpenForArgs {
  name: string;
  tournaments: string[];
}

/**
 * Owns the state for the coach "שיוך לתחרות" modal. Mirrors the player
 * tournament registration flow, driven by a coach's name plus the list of
 * תחרויות they are assigned to.
 *
 * The modal starts read-only; "עריכה" flips it into edit mode, where each
 * assignment can be removed (after an inline "האם אתה בטוח" confirm) and the
 * coach can be assigned to an existing תחרות. Adding/removing are UI-only for
 * now — confirm/remove deliberately do nothing.
 */
export function useCoachTournamentRegistration() {
  const [open, setOpen] = useState(false);
  const [coachName, setCoachName] = useState("");
  const [tournaments, setTournaments] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  // The tournament name whose removal is awaiting an inline "are you sure" confirm.
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  // The tournament selected in the "assign to existing תחרות" dropdown.
  const [selectedTournament, setSelectedTournament] = useState("");

  const registered = useMemo(
    () => registeredTournamentsFor(tournaments),
    [tournaments],
  );
  const available = useMemo(
    () => availableTournamentsFor(tournaments),
    [tournaments],
  );

  const openFor = useCallback(
    ({ name, tournaments: tournamentNames }: OpenForArgs) => {
      setCoachName(name);
      setTournaments(tournamentNames);
      setEditing(false);
      setPendingRemoval(null);
      setSelectedTournament("");
      setOpen(true);
    },
    [],
  );

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setEditing(false);
      setPendingRemoval(null);
      setSelectedTournament("");
    }
  }, []);

  const startEditing = useCallback(() => setEditing(true), []);

  const stopEditing = useCallback(() => {
    setEditing(false);
    setPendingRemoval(null);
    setSelectedTournament("");
  }, []);

  const requestRemove = useCallback((name: string) => {
    setPendingRemoval(name);
  }, []);

  const cancelRemove = useCallback(() => setPendingRemoval(null), []);

  const confirmRemove = useCallback(() => {
    // UI only for now — the actual removal is wired up elsewhere later.
    setPendingRemoval(null);
  }, []);

  const addTournament = useCallback(() => {
    // UI only for now — the actual assignment is wired up elsewhere later.
  }, []);

  return {
    open,
    coachName,
    editing,
    registered,
    available,
    pendingRemoval,
    selectedTournament,
    setSelectedTournament,
    openFor,
    handleOpenChange,
    startEditing,
    stopEditing,
    requestRemove,
    cancelRemove,
    confirmRemove,
    addTournament,
  };
}
