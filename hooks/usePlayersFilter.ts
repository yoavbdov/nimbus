import { useMemo, useState } from "react";
import { filterPlayers, type PlayerFilter } from "@/lib/players-filters";

export function usePlayersFilter() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<PlayerFilter[]>([]);

  function addFilter(filter: PlayerFilter) {
    setFilters((prev) => [...prev, filter]);
  }

  function removeFilter(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }

  function updateFilter(id: string, next: PlayerFilter) {
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...next, id } : f)));
  }

  function clearAll() {
    setFilters([]);
    setSearch("");
  }

  const filtered = useMemo(
    () => filterPlayers(search, filters),
    [search, filters],
  );

  return {
    search,
    setSearch,
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    clearAll,
    filtered,
  };
}
