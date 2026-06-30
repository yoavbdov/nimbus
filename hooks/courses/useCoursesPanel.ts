import { useMemo } from "react";
import { useCoursesFilter } from "@/hooks/useCoursesFilter";

export function useCoursesPanel() {
  const filter = useCoursesFilter();
  const filterKey = useMemo(
    () =>
      JSON.stringify({
        search: filter.search,
        filters: filter.filters,
        todayOnly: filter.todayOnly,
      }),
    [filter.search, filter.filters, filter.todayOnly],
  );
  return { ...filter, filterKey };
}
