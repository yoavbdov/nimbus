import { useCallback, useMemo, useState } from "react";
import type { LeagueCategory, LeagueTeam } from "@/lib/leagues-data";
import { useCollection } from "@/lib/firebase/useCollection";
import {
  addRelation,
  removeRelationsForSubject,
} from "@/lib/firebase/data/relations";

interface OpenForArgs {
  id: string;
  name: string;
  leagueTeam: string | null;
}

/**
 * Owns the state for the "הרשמה לליגה" modal. Driven by a player's name plus the
 * single league team they're on (or null), so any table (players page or the
 * dashboard rating table) can open it. Teams are read live from Firestore.
 *
 * A player belongs to at most one league team. While assigned, the player is
 * considered registered and the join list is empty — they must be removed from
 * the current team before they can register to a different one. The player's
 * `leagueTeam` name is the source of truth: even if it isn't found in the live
 * teams (e.g. an unseeded name), the modal still treats them as registered.
 *
 * Register/remove only stage the choice locally against the `baseline` (the
 * persisted team); nothing is written until "עדכן", which diffs staged vs.
 * baseline and persists. Closing with an unsaved change asks first
 * (`confirmingClose`) before discarding it.
 */
export function useLeagueRegistration() {
  const { data: teams } = useCollection<LeagueTeam>("leagues");
  const [open, setOpen] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  // The staged team, and the persisted team to diff against.
  const [leagueTeam, setLeagueTeam] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);
  // Whether the current team's removal is awaiting an inline "are you sure" confirm.
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  // The category the available-teams list is filtered to (null = all categories).
  const [categoryFilter, setCategoryFilter] = useState<LeagueCategory | null>(
    null,
  );
  // Free-text query that narrows the available-teams list by name.
  const [query, setQuery] = useState("");
  // Whether a close request is awaiting the "discard unsaved change" confirm.
  const [confirmingClose, setConfirmingClose] = useState(false);
  // Bumped on each repeated close attempt while confirming, to replay the shake.
  const [closeNudge, setCloseNudge] = useState(0);

  const registered = useMemo<LeagueTeam | null>(() => {
    if (!leagueTeam) return null;
    return (
      teams.find((t) => t.name === leagueTeam) ?? {
        id: leagueTeam,
        name: leagueTeam,
        category: "בוגרים",
        rank: "",
        notes: "",
        players: [],
      }
    );
  }, [leagueTeam, teams]);

  // While the player is on a team the join list is empty — removal comes first.
  const available = useMemo(() => {
    if (leagueTeam) return [];
    const trimmed = query.trim();
    return teams.filter(
      (t) =>
        (!categoryFilter || t.category === categoryFilter) &&
        (!trimmed || t.name.includes(trimmed)),
    );
  }, [teams, leagueTeam, categoryFilter, query]);

  const dirty = leagueTeam !== baseline;

  const openFor = useCallback(({ id, name, leagueTeam: team }: OpenForArgs) => {
    setPlayerId(id);
    setPlayerName(name);
    setLeagueTeam(team);
    setBaseline(team);
    setConfirmingRemoval(false);
    setCategoryFilter(null);
    setQuery("");
    setConfirmingClose(false);
    setCloseNudge(0);
    setOpen(true);
  }, []);

  // Discards any staged change and closes the modal.
  const doClose = useCallback(() => {
    setOpen(false);
    setConfirmingRemoval(false);
    setCategoryFilter(null);
    setQuery("");
    setConfirmingClose(false);
    setLeagueTeam(baseline);
  }, [baseline]);

  // Radix close requests (Escape / backdrop / סגור) route through here: with an
  // unsaved change, ask before discarding instead of closing.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setOpen(true);
        return;
      }
      if (dirty) {
        if (confirmingClose) {
          setCloseNudge((n) => n + 1);
        } else {
          setConfirmingClose(true);
        }
        return;
      }
      doClose();
    },
    [dirty, confirmingClose, doClose],
  );

  const cancelClose = useCallback(() => setConfirmingClose(false), []);

  const requestRemove = useCallback(() => setConfirmingRemoval(true), []);

  const cancelRemove = useCallback(() => setConfirmingRemoval(false), []);

  const confirmRemove = useCallback(() => {
    setLeagueTeam(null);
    setConfirmingRemoval(false);
  }, []);

  // Guard: refuse to register while already on a team; the player must be
  // removed from their current team first.
  const register = useCallback(
    (team: string) => {
      if (leagueTeam) return;
      setLeagueTeam(team);
      setQuery("");
    },
    [leagueTeam],
  );

  // "עדכן": persist the staged team against baseline, then close. League
  // membership is single-valued, so clear any stray relation before adding.
  const commit = useCallback(() => {
    if (leagueTeam !== baseline) {
      void removeRelationsForSubject("player_league", playerId).then(() => {
        if (leagueTeam) {
          return addRelation({
            kind: "player_league",
            subjectType: "player",
            subjectId: playerId,
            targetType: "league",
            targetId: leagueTeam,
          });
        }
      });
    }
    doClose();
  }, [leagueTeam, baseline, playerId, doClose]);

  return {
    open,
    playerName,
    registered,
    available,
    confirmingRemoval,
    categoryFilter,
    setCategoryFilter,
    query,
    setQuery,
    dirty,
    confirmingClose,
    closeNudge,
    openFor,
    handleOpenChange,
    requestRemove,
    cancelRemove,
    confirmRemove,
    register,
    commit,
    confirmClose: doClose,
    cancelClose,
  };
}
