import { useMemo } from "react";
import { useCoachesFilter } from "@/hooks/useCoachesFilter";
import { useCoachStatuses } from "@/hooks/coaches/useCoachStatuses";

export function useCoachesPanel() {
  const { coaches, toggleStatus } = useCoachStatuses();
  const filter = useCoachesFilter(coaches);
  const filterKey = useMemo(
    () => JSON.stringify({ search: filter.search, filters: filter.filters }),
    [filter.search, filter.filters],
  );
  return { ...filter, coaches, toggleStatus, filterKey };
}
