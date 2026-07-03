import { useCallback, useMemo, useState } from "react";
import type { LeagueCategory, LeagueTeam } from "@/lib/leagues-data";
import { useCollection } from "@/lib/firebase/useCollection";
import { updatePlayer } from "@/lib/firebase/data/players";

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
 */
export function useLeagueRegistration() {
  const { data: teams } = useCollection<LeagueTeam>("leagues");
  const [open, setOpen] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [leagueTeam, setLeagueTeam] = useState<string | null>(null);
  // Whether the current team's removal is awaiting an inline "are you sure" confirm.
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  // The category the available-teams list is filtered to (null = all categories).
  const [categoryFilter, setCategoryFilter] = useState<LeagueCategory | null>(
    null,
  );
  // Free-text query that narrows the available-teams list by name.
  const [query, setQuery] = useState("");

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

  const openFor = useCallback(({ id, name, leagueTeam: team }: OpenForArgs) => {
    setPlayerId(id);
    setPlayerName(name);
    setLeagueTeam(team);
    setConfirmingRemoval(false);
    setCategoryFilter(null);
    setQuery("");
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setConfirmingRemoval(false);
      setCategoryFilter(null);
      setQuery("");
    }
  }, []);

  const requestRemove = useCallback(() => setConfirmingRemoval(true), []);

  const cancelRemove = useCallback(() => setConfirmingRemoval(false), []);

  const confirmRemove = useCallback(() => {
    setLeagueTeam(null);
    setConfirmingRemoval(false);
    void updatePlayer(playerId, { leagueTeam: null });
  }, [playerId]);

  // Guard: refuse to register while already on a team; the player must be
  // removed from their current team first.
  const register = useCallback(
    (team: string) => {
      if (leagueTeam) return;
      setLeagueTeam(team);
      setQuery("");
      void updatePlayer(playerId, { leagueTeam: team });
    },
    [leagueTeam, playerId],
  );

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
    openFor,
    handleOpenChange,
    requestRemove,
    cancelRemove,
    confirmRemove,
    register,
  };
}
