import { useMemo } from "react";
import { useCoursesFilter } from "@/hooks/useCoursesFilter";
import { useCoursesData } from "@/hooks/courses/useCoursesData";
import { OUTSIDE_CLUB_ROOM } from "@/lib/rooms-data";
import type { FieldOptions } from "@/lib/courses-filters";

/**
 * Drives the חוגים page: the course list is read live from Firestore (enrolled
 * count + coach projected from `relations`), then fed into the filter/search
 * hook. `total` is the full live count; `filterKey` re-triggers the table
 * animation on any filter change.
 */
export function useCoursesPanel() {
  const { courses, loading } = useCoursesData();
  // Live מדריך/חדר dropdown options for the filter, sourced from the real
  // courses (coach projected from relations) so a filter matches live data.
  const filterOptions = useMemo<FieldOptions>(
    () => ({
      coach: Array.from(
        new Set(courses.map((c) => c.coach).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b, "he")),
      room: Array.from(
        new Set([...courses.map((c) => c.room), OUTSIDE_CLUB_ROOM]),
      ).sort((a, b) => a.localeCompare(b, "he")),
    }),
    [courses],
  );
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
  return { ...filter, courses, total: courses.length, loading, filterKey, filterOptions };
}
