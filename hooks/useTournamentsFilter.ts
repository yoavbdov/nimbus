import { useMemo, useState } from "react";
import { filterTournaments, type TournamentFilter } from "@/lib/tournaments-filters";
import type { Tournament } from "@/lib/tournaments-data";

export function useTournamentsFilter(tournaments: Tournament[]) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<TournamentFilter[]>([]);
  const [todayOnly, setTodayOnly] = useState(false);

  function addFilter(filter: TournamentFilter) {
    setFilters((prev) => [...prev, filter]);
  }

  function removeFilter(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }

  function updateFilter(id: string, next: TournamentFilter) {
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...next, id } : f)));
  }

  function toggleToday() {
    setTodayOnly((v) => !v);
  }

  function clearAll() {
    setFilters([]);
    setSearch("");
    setTodayOnly(false);
  }

  const filtered = useMemo(
    () => filterTournaments(tournaments, search, filters, todayOnly),
    [tournaments, search, filters, todayOnly],
  );

  return {
    search,
    setSearch,
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    todayOnly,
    toggleToday,
    clearAll,
    filtered,
  };
}
