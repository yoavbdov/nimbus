import { useMemo, useState } from "react";
import {
  filterEquipmentAdvanced,
  type EquipmentFilter,
} from "@/lib/equipment-filters";
import type { Equipment } from "@/lib/rooms-data";

/** Owns the equipment search + advanced filter state; mirrors useRoomsFilter. */
export function useEquipmentFilter(equipment: Equipment[]) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<EquipmentFilter[]>([]);

  function addFilter(filter: EquipmentFilter) {
    setFilters((prev) => [...prev, filter]);
  }

  function removeFilter(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }

  function updateFilter(id: string, next: EquipmentFilter) {
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...next, id } : f)));
  }

  function clearAll() {
    setFilters([]);
    setSearch("");
  }

  const filtered = useMemo(
    () => filterEquipmentAdvanced(equipment, search, filters),
    [equipment, search, filters],
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
