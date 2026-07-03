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
 * Owns the state for the "הרשמה לתחרויות" modal. Driven by a player's name plus
 * the list of תחרויות they're registered to, so any table (players page or the
 * dashboard rating table) can open it.
 *
 * The modal starts read-only; "עריכה" flips it into edit mode, where each
 * registration can be removed (after an inline "האם אתה בטוח" confirm) and the
 * player can be added to an existing תחרות. Adding/removing are UI-only for now —
 * confirm/remove deliberately do nothing.
 */
export function useTournamentRegistration() {
  const [open, setOpen] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [tournaments, setTournaments] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  // The tournament name whose removal is awaiting an inline "are you sure" confirm.
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  // The tournament selected in the "add to existing תחרות" dropdown.
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
      setPlayerId(id);
      setPlayerName(name);
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
    void removeRelation("player_tournament", playerId, pendingRemoval);
    setPendingRemoval(null);
  }, [pendingRemoval, playerId]);

  const addTournament = useCallback(() => {
    if (!selectedTournament || tournaments.includes(selectedTournament)) return;
    setTournaments((prev) => [...prev, selectedTournament]);
    void addRelation({
      kind: "player_tournament",
      subjectType: "player",
      subjectId: playerId,
      targetType: "tournament",
      targetId: selectedTournament,
    });
    setSelectedTournament("");
  }, [selectedTournament, tournaments, playerId]);

  return {
    open,
    playerName,
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
