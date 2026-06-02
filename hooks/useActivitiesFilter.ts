import { useMemo, useState } from "react";
import { filterActivities, type ActivityFilter } from "@/lib/activities-filters";

export function useActivitiesFilter() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ActivityFilter[]>([]);
  const [todayOnly, setTodayOnly] = useState(false);

  function addFilter(filter: ActivityFilter) {
    setFilters((prev) => [...prev, filter]);
  }

  function removeFilter(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }

  function updateFilter(id: string, next: ActivityFilter) {
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
    () => filterActivities(search, filters, todayOnly),
    [search, filters, todayOnly],
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
