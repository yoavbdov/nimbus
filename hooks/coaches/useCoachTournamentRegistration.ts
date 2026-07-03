import { useCallback, useMemo, useState } from "react";
import {
  availableTournamentsFor,
  registeredTournamentsFor,
} from "@/lib/tournament-registration";
import { addRelation, removeRelation } from "@/lib/firebase/data/relations";
import { useCollection } from "@/lib/firebase/useCollection";
import type { Tournament } from "@/lib/tournaments-data";

interface OpenForArgs {
  id: string;
  name: string;
  tournaments: string[];
}

/**
 * Owns the state for the coach "שיוך לתחרות" modal. Mirrors the player
 * tournament registration flow, driven by a coach's id + name plus the list of
 * תחרויות they are assigned to.
 *
 * The modal starts read-only; "עריכה" flips it into edit mode, where each
 * assignment can be removed (after an inline "האם אתה בטוח" confirm) and the
 * coach can be assigned to an existing תחרות. Both add and remove persist a
 * `coach_tournament` relation.
 */
export function useCoachTournamentRegistration() {
  const [open, setOpen] = useState(false);
  const [coachId, setCoachId] = useState("");
  const [coachName, setCoachName] = useState("");
  const [tournaments, setTournaments] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  // The tournament name whose removal is awaiting an inline "are you sure" confirm.
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  // The tournament selected in the "assign to existing תחרות" dropdown.
  const [selectedTournament, setSelectedTournament] = useState("");

  const { data: allTournaments } = useCollection<Tournament>("tournaments");

  const registered = useMemo(
    () => registeredTournamentsFor(tournaments, allTournaments),
    [tournaments, allTournaments],
  );
  const available = useMemo(
    () => availableTournamentsFor(tournaments, allTournaments),
    [tournaments, allTournaments],
  );

  const openFor = useCallback(
    ({ id, name, tournaments: tournamentNames }: OpenForArgs) => {
      setCoachId(id);
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
    if (!pendingRemoval) return;
    setTournaments((prev) => prev.filter((t) => t !== pendingRemoval));
    void removeRelation("coach_tournament", coachId, pendingRemoval);
    setPendingRemoval(null);
  }, [pendingRemoval, coachId]);

  const addTournament = useCallback(() => {
    if (!selectedTournament || tournaments.includes(selectedTournament)) return;
    setTournaments((prev) => [...prev, selectedTournament]);
    void addRelation({
      kind: "coach_tournament",
      subjectType: "coach",
      subjectId: coachId,
      targetType: "tournament",
      targetId: selectedTournament,
    });
    setSelectedTournament("");
  }, [selectedTournament, tournaments, coachId]);

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
