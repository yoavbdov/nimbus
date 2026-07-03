import { useMemo } from "react";
import { useCoachesFilter } from "@/hooks/useCoachesFilter";
import { useCoachStatuses } from "@/hooks/coaches/useCoachStatuses";
import { useRelationNames } from "@/hooks/relations/useRelationNames";
import { useCollection } from "@/lib/firebase/useCollection";
import type { CoachAssociations, CoachRecord } from "@/lib/coaches-data";
import type { FieldOptions } from "@/lib/coaches-filters";
import type { Course } from "@/lib/courses-data";

/**
 * Drives the coaches page: the roster is read live from Firestore, each coach is
 * enriched with its course/tournament associations projected from `relations`,
 * its status derived, and the result fed into the filter/search hook. `coaches`
 * is the full live list (for the action modals); `filterKey` re-triggers the
 * table animation.
 */
export function useCoachesPanel() {
  const { data: records, loading } = useCollection<CoachRecord>("coaches");
  const { coachCourses, coachTournaments, loading: relationsLoading } =
    useRelationNames();

  const enriched = useMemo<(CoachRecord & CoachAssociations)[]>(
    () =>
      records.map((record) => {
        const tournaments = coachTournaments.get(record.id) ?? [];
        return {
          ...record,
          courses: coachCourses.get(record.id) ?? [],
          tournaments,
          competitions: tournaments.length,
        };
      }),
    [records, coachCourses, coachTournaments],
  );

  // Live חוג dropdown options for the filter, sourced from the real courses
  // collection (not the static mock) so a filter matches live data.
  const { data: courses } = useCollection<Course>("courses");
  const filterOptions = useMemo<FieldOptions>(
    () => ({
      club: Array.from(new Set(courses.map((c) => c.name))).sort((a, b) =>
        a.localeCompare(b, "he"),
      ),
    }),
    [courses],
  );

  const { coaches, toggleStatus } = useCoachStatuses(enriched);
  const filter = useCoachesFilter(coaches);
  const filterKey = useMemo(
    () => JSON.stringify({ search: filter.search, filters: filter.filters }),
    [filter.search, filter.filters],
  );
  return {
    ...filter,
    coaches,
    toggleStatus,
    filterKey,
    loading: loading || relationsLoading,
    filterOptions,
  };
}
