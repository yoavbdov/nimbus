import { useCallback, useMemo, useState } from "react";
import {
  availableLeagueTeamsFor,
  registeredLeagueTeamFor,
} from "@/lib/league-registration";
import type { LeagueCategory } from "@/lib/leagues-data";

interface OpenForArgs {
  name: string;
  leagueTeam: string | null;
}

/**
 * Owns the state for the "הרשמה לליגה" modal. Driven by a player's name plus the
 * single league team they're on (or null), so any table (players page or the
 * dashboard rating table) can open it.
 *
 * Unlike חוגים/תחרויות, a player belongs to at most one league team. When
 * registered the modal shows that team with an option to remove (after an inline
 * "are you sure" confirm); when unregistered it lists the teams to register to.
 * Registering/removing are UI-only for now — they deliberately do nothing.
 */
export function useLeagueRegistration() {
  const [open, setOpen] = useState(false);
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

  const registered = useMemo(
    () => registeredLeagueTeamFor(leagueTeam),
    [leagueTeam],
  );
  const available = useMemo(() => {
    const trimmed = query.trim();
    return availableLeagueTeamsFor(leagueTeam).filter(
      (t) =>
        (!categoryFilter || t.category === categoryFilter) &&
        (!trimmed || t.name.includes(trimmed)),
    );
  }, [leagueTeam, categoryFilter, query]);

  const openFor = useCallback(({ name, leagueTeam: team }: OpenForArgs) => {
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
    // UI only for now — the actual removal is wired up elsewhere later.
    setConfirmingRemoval(false);
  }, []);

  const register = useCallback(() => {
    // UI only for now — the actual registration is wired up elsewhere later.
  }, []);

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
