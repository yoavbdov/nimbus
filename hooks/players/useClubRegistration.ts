import { useCallback, useMemo, useState } from "react";
import {
  availableClubsFor,
  registeredClubsFor,
} from "@/lib/club-registration";
import { updatePlayer } from "@/lib/firebase/data/players";

interface OpenForArgs {
  id: string;
  name: string;
  clubs: string[];
}

/**
 * Owns the state for the "הרשמה לחוגים" modal. Driven by a player's name plus
 * the list of חוגים they're registered to, so any table (players page or the
 * dashboard rating table) can open it.
 *
 * The modal starts read-only; "עריכה" flips it into edit mode, where each
 * registration can be removed (after an inline "האם אתה בטוח" confirm) and the
 * player can be added to an existing חוג. Adding/removing are UI-only for now —
 * confirm/remove deliberately do nothing.
 */
export function useClubRegistration() {
  const [open, setOpen] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [clubs, setClubs] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  // The club name whose removal is awaiting an inline "are you sure" confirm.
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  // The club selected in the "add to existing חוג" dropdown.
  const [selectedClub, setSelectedClub] = useState("");

  const registered = useMemo(() => registeredClubsFor(clubs), [clubs]);
  const available = useMemo(() => availableClubsFor(clubs), [clubs]);

  const openFor = useCallback(({ id, name, clubs: clubNames }: OpenForArgs) => {
    setPlayerId(id);
    setPlayerName(name);
    setClubs(clubNames);
    setEditing(false);
    setPendingRemoval(null);
    setSelectedClub("");
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setEditing(false);
      setPendingRemoval(null);
      setSelectedClub("");
    }
  }, []);

  const startEditing = useCallback(() => setEditing(true), []);

  const stopEditing = useCallback(() => {
    setEditing(false);
    setPendingRemoval(null);
    setSelectedClub("");
  }, []);

  const requestRemove = useCallback((name: string) => {
    setPendingRemoval(name);
  }, []);

  const cancelRemove = useCallback(() => setPendingRemoval(null), []);

  const confirmRemove = useCallback(() => {
    if (!pendingRemoval) return;
    const next = clubs.filter((c) => c !== pendingRemoval);
    setClubs(next);
    setPendingRemoval(null);
    void updatePlayer(playerId, { clubs: next });
  }, [pendingRemoval, clubs, playerId]);

  const addClub = useCallback(() => {
    if (!selectedClub || clubs.includes(selectedClub)) return;
    const next = [...clubs, selectedClub];
    setClubs(next);
    setSelectedClub("");
    void updatePlayer(playerId, { clubs: next });
  }, [selectedClub, clubs, playerId]);

  return {
    open,
    playerName,
    editing,
    registered,
    available,
    pendingRemoval,
    selectedClub,
    setSelectedClub,
    openFor,
    handleOpenChange,
    startEditing,
    stopEditing,
    requestRemove,
    cancelRemove,
    confirmRemove,
    addClub,
  };
}
