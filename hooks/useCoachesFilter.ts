import { useMemo, useState } from "react";
import { filterCoaches, type CoachFilter } from "@/lib/coaches-filters";
import type { Coach } from "@/lib/coaches-data";

export function useCoachesFilter(coaches: Coach[]) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CoachFilter[]>([]);

  function addFilter(filter: CoachFilter) {
    setFilters((prev) => [...prev, filter]);
  }

  function removeFilter(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }

  function updateFilter(id: string, next: CoachFilter) {
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...next, id } : f)));
  }

  function clearAll() {
    setFilters([]);
    setSearch("");
  }

  const filtered = useMemo(
    () => filterCoaches(coaches, search, filters),
    [coaches, search, filters],
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
