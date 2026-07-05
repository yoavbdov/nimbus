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
 * player can be added to an existing תחרות. Edits are staged locally against the
 * `baseline` (the persisted list) and nothing is written until "עדכן": that
 * diffs staged vs. baseline, persists the adds/removes, and closes. Closing with
 * unsaved edits asks first (`confirmingClose`) before discarding them.
 */
export function useTournamentRegistration() {
  const [open, setOpen] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  // The staged list being edited, and the persisted list to diff against.
  const [tournaments, setTournaments] = useState<string[]>([]);
  const [baseline, setBaseline] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  // The tournament name whose removal is awaiting an inline "are you sure" confirm.
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  // The tournament selected in the "add to existing תחרות" dropdown.
  const [selectedTournament, setSelectedTournament] = useState("");
  // Whether a close request is awaiting the "discard unsaved edits" confirm.
  const [confirmingClose, setConfirmingClose] = useState(false);
  // Bumped on each repeated close attempt while confirming, to replay the shake.
  const [closeNudge, setCloseNudge] = useState(0);

  const { data: allTournaments } = useCollection<Tournament>("tournaments");

  const registered = useMemo(
    () => registeredTournamentsFor(tournaments, allTournaments),
    [tournaments, allTournaments],
  );
  const available = useMemo(
    () => availableTournamentsFor(tournaments, allTournaments),
    [tournaments, allTournaments],
  );

  const dirty = useMemo(() => {
    if (tournaments.length !== baseline.length) return true;
    const base = new Set(baseline);
    return tournaments.some((t) => !base.has(t));
  }, [tournaments, baseline]);

  const openFor = useCallback(
    ({ id, name, tournaments: tournamentNames }: OpenForArgs) => {
      setPlayerId(id);
      setPlayerName(name);
      setTournaments(tournamentNames);
      setBaseline(tournamentNames);
      setEditing(false);
      setPendingRemoval(null);
      setSelectedTournament("");
      setConfirmingClose(false);
      setCloseNudge(0);
      setOpen(true);
    },
    [],
  );

  // Discards any staged edits and closes the modal.
  const doClose = useCallback(() => {
    setOpen(false);
    setEditing(false);
    setPendingRemoval(null);
    setSelectedTournament("");
    setConfirmingClose(false);
    setTournaments(baseline);
  }, [baseline]);

  // Radix close requests (Escape / backdrop / סגור / ביטול) route through here:
  // with unsaved edits, ask before discarding instead of closing.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setOpen(true);
        return;
      }
      if (editing && dirty) {
        if (confirmingClose) {
          setCloseNudge((n) => n + 1);
        } else {
          setConfirmingClose(true);
        }
        return;
      }
      doClose();
    },
    [editing, dirty, confirmingClose, doClose],
  );

  const cancelClose = useCallback(() => setConfirmingClose(false), []);

  const startEditing = useCallback(() => setEditing(true), []);

  const requestRemove = useCallback((name: string) => {
    setPendingRemoval(name);
  }, []);

  const cancelRemove = useCallback(() => setPendingRemoval(null), []);

  const confirmRemove = useCallback(() => {
    if (!pendingRemoval) return;
    setTournaments((prev) => prev.filter((t) => t !== pendingRemoval));
    setPendingRemoval(null);
  }, [pendingRemoval]);

  const addTournament = useCallback(() => {
    if (!selectedTournament || tournaments.includes(selectedTournament)) return;
    setTournaments((prev) => [...prev, selectedTournament]);
    setSelectedTournament("");
  }, [selectedTournament, tournaments]);

  // "עדכן": persist the staged diff (adds + removes) against baseline, then close.
  const commit = useCallback(() => {
    const base = new Set(baseline);
    const staged = new Set(tournaments);
    tournaments
      .filter((name) => !base.has(name))
      .forEach((name) => {
        void addRelation({
          kind: "player_tournament",
          subjectType: "player",
          subjectId: playerId,
          targetType: "tournament",
          targetId: name,
        });
      });
    baseline
      .filter((name) => !staged.has(name))
      .forEach((name) => {
        void removeRelation("player_tournament", playerId, name);
      });
    doClose();
  }, [baseline, tournaments, playerId, doClose]);

  return {
    open,
    playerName,
    editing,
    registered,
    available,
    pendingRemoval,
    selectedTournament,
    setSelectedTournament,
    dirty,
    confirmingClose,
    closeNudge,
    openFor,
    handleOpenChange,
    startEditing,
    requestRemove,
    cancelRemove,
    confirmRemove,
    addTournament,
    commit,
    confirmClose: doClose,
    cancelClose,
  };
}
