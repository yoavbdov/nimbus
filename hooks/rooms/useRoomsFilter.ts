import { useMemo, useState } from "react";
import { filterRoomsAdvanced, type RoomFilter } from "@/lib/rooms-filters";

export function useRoomsFilter() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<RoomFilter[]>([]);

  function addFilter(filter: RoomFilter) {
    setFilters((prev) => [...prev, filter]);
  }

  function removeFilter(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }

  function updateFilter(id: string, next: RoomFilter) {
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...next, id } : f)));
  }

  function clearAll() {
    setFilters([]);
    setSearch("");
  }

  const filtered = useMemo(
    () => filterRoomsAdvanced(search, filters),
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
