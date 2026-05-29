import { useMemo } from "react";
import { usePlayersFilter } from "@/hooks/usePlayersFilter";

export function usePlayersPanel() {
  const filter = usePlayersFilter();
  const filterKey = useMemo(
    () => JSON.stringify({ search: filter.search, filters: filter.filters }),
    [filter.search, filter.filters],
  );
  return { ...filter, filterKey };
}
