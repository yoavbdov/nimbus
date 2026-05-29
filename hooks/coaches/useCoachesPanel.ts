import { useMemo } from "react";
import { useCoachesFilter } from "@/hooks/useCoachesFilter";

export function useCoachesPanel() {
  const filter = useCoachesFilter();
  const filterKey = useMemo(
    () => JSON.stringify({ search: filter.search, filters: filter.filters }),
    [filter.search, filter.filters],
  );
  return { ...filter, filterKey };
}
