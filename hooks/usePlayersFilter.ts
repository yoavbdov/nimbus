import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { filterPlayers, type PlayerFilter } from "@/lib/players-filters";

function initialRatingFilters(min: string | null, max: string | null): PlayerFilter[] {
  const filters: PlayerFilter[] = [];
  if (min != null && min !== "") {
    filters.push({ id: "rating-min", field: "israeliRating", op: "gte", value: Number(min) });
  }
  if (max != null && max !== "") {
    filters.push({ id: "rating-max", field: "israeliRating", op: "lte", value: Number(max) });
  }
  return filters;
}

export function usePlayersFilter() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<PlayerFilter[]>(() =>
    initialRatingFilters(searchParams.get("ratingMin"), searchParams.get("ratingMax")),
  );

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
