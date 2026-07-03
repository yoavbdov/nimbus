import { useMemo } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import { courseOccupancy, type Course } from "@/lib/courses-data";
import type { RelationDoc } from "@/lib/relations-data";

/**
 * Reads the courses live from Firestore and projects the associations that are
 * NOT stored on the course doc: the enrolled count (number of `player_course`
 * links) and the assigned coach (the `coach_course` link). Docs are keyed by
 * name, so a relation's `targetId`/`subjectId` already IS the display name.
 *
 * `occupancy` is derived from the real enrolled count, never authored.
 */
export function useCoursesData() {
  const { data: records, loading } = useCollection<Course>("courses");
  const { data: relations, loading: relationsLoading } =
    useCollection<RelationDoc>("relations");

  const courses = useMemo<Course[]>(() => {
    const enrolled = new Map<string, number>();
    const coach = new Map<string, string>();
    for (const rel of relations) {
      if (rel.kind === "player_course") {
        enrolled.set(rel.targetId, (enrolled.get(rel.targetId) ?? 0) + 1);
      } else if (rel.kind === "coach_course") {
        coach.set(rel.targetId, rel.subjectId);
      }
    }
    return records.map((course) => {
      const count = enrolled.get(course.id) ?? 0;
      return {
        ...course,
        coach: coach.get(course.id) ?? course.coach ?? "",
        enrolled: count,
        occupancy: courseOccupancy(count, course.capacity),
      };
    });
  }, [records, relations]);

  return { courses, loading: loading || relationsLoading };
}
