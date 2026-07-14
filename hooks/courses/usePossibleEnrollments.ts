import { useCallback, useMemo, useState } from "react";
import {
  possibleEnrollments,
  type EnrollmentCandidate,
} from "@/lib/possible-enrollments";
import { useCollection } from "@/lib/firebase/useCollection";
import type { Course } from "@/lib/courses-data";
import type { Player } from "@/lib/players-data";
import type { RelationDoc } from "@/lib/relations-data";

/**
 * Drives the "possible enrollments" dialog: which course it shows and its
 * candidates. Both the roster and the "already enrolled" set are read LIVE from
 * Firestore (players + the `player_course` relations), so the list reflects the
 * real data, never a static mock.
 */
export function usePossibleEnrollments() {
  const [course, setCourse] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);
  const { data: players } = useCollection<Player>("players");
  const { data: relations } = useCollection<RelationDoc>("relations");

  const openFor = useCallback((next: Course) => {
    setCourse(next);
    setOpen(true);
  }, []);

  const candidates: EnrollmentCandidate[] = useMemo(() => {
    if (!course) return [];
    const enrolledIds = new Set(
      relations
        .filter((r) => r.kind === "player_course" && r.targetId === course.id)
        .map((r) => r.subjectId),
    );
    return possibleEnrollments(course, players, enrolledIds);
  }, [course, players, relations]);

  return { open, onOpenChange: setOpen, openFor, course, candidates };
}
