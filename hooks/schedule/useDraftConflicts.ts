import { useCallback } from "react";
import { addMonths, toISODate } from "@/lib/calendar";
import { useCollection } from "@/lib/firebase/useCollection";
import {
  draftConflicts,
  categoryOfParentType,
  type DraftConflict,
} from "@/lib/conflicts";
import type { SessionDoc } from "@/lib/sessions-data";
import type { RelationDoc } from "@/lib/relations-data";
import type { Course } from "@/lib/courses-data";
import type { Tournament } from "@/lib/tournaments-data";
import type { ClubEvent } from "@/lib/events-data";

/**
 * Reads the live schedule (sessions + parents + instructor relations) and hands
 * back a pure `check` that a create/edit modal calls with its draft sessions to
 * find every activity the draft would clash with (room / coach). All Firestore
 * access stays here; the modal hooks and the engine stay data-only.
 */
export function useDraftConflicts() {
  const { data: sessions } = useCollection<SessionDoc>("sessions");
  const { data: relations } = useCollection<RelationDoc>("relations");
  const { data: courses } = useCollection<Course>("courses");
  const { data: tournaments } = useCollection<Tournament>("tournaments");
  const { data: events } = useCollection<ClubEvent>("events");

  const check = useCallback(
    (draftSessions: SessionDoc[], draftCoach: string): DraftConflict[] => {
      // Active parents only — a clash with an archived activity is moot.
      const activeParents = new Set<string>([
        ...courses.filter((c) => c.status !== "ארכיון").map((c) => c.id),
        ...tournaments.filter((t) => t.status !== "ארכיון").map((t) => t.id),
        ...events.filter((e) => e.status !== "ארכיון").map((e) => e.id),
      ]);

      // Instructor per activity: a course's coach or a tournament's judge.
      const instructorByParent = new Map<string, string>();
      for (const rel of relations) {
        if (rel.kind === "coach_course" || rel.kind === "coach_tournament") {
          instructorByParent.set(rel.targetId, rel.subjectId);
        }
      }

      // Look a year ahead so future recurrences surface with a concrete date,
      // while open-ended series stay bounded.
      const now = new Date();
      const rangeStart = toISODate(now);
      const rangeEnd = toISODate(addMonths(now, 12));

      return draftConflicts(
        draftSessions,
        draftCoach,
        sessions,
        (parentId) => instructorByParent.get(parentId) ?? "",
        (session) =>
          activeParents.has(session.parentId)
            ? {
                title: session.parentId,
                category: categoryOfParentType(session.parentType),
              }
            : null,
        rangeStart,
        rangeEnd,
      );
    },
    [sessions, relations, courses, tournaments, events],
  );

  return { check };
}
