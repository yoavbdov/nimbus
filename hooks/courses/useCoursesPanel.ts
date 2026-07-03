import { useMemo } from "react";
import { useCoursesFilter } from "@/hooks/useCoursesFilter";
import { useCoursesData } from "@/hooks/courses/useCoursesData";

/**
 * Drives the חוגים page: the course list is read live from Firestore (enrolled
 * count + coach projected from `relations`), then fed into the filter/search
 * hook. `total` is the full live count; `filterKey` re-triggers the table
 * animation on any filter change.
 */
export function useCoursesPanel() {
  const { courses, loading } = useCoursesData();
  const filter = useCoursesFilter(courses);
  const filterKey = useMemo(
    () =>
      JSON.stringify({
        search: filter.search,
        filters: filter.filters,
        todayOnly: filter.todayOnly,
      }),
    [filter.search, filter.filters, filter.todayOnly],
  );
  return { ...filter, courses, total: courses.length, loading, filterKey };
}
