import { useMemo, useState } from "react";
import { filterEvents, type EventFilter } from "@/lib/events-filters";
import type { ClubEvent } from "@/lib/events-data";

export function useEventsFilter(events: ClubEvent[]) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<EventFilter[]>([]);
  const [todayOnly, setTodayOnly] = useState(false);

  function addFilter(filter: EventFilter) {
    setFilters((prev) => [...prev, filter]);
  }

  function removeFilter(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }

  function updateFilter(id: string, next: EventFilter) {
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
    () => filterEvents(events, search, filters, todayOnly),
    [events, search, filters, todayOnly],
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
