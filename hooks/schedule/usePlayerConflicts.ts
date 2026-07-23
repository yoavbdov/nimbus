import { useCallback } from "react";
import { addMonths, toISODate } from "@/lib/calendar";
import { useCollection } from "@/lib/firebase/useCollection";
import {
  busyPlayers,
  categoryOfParentType,
  playerBusyLabel,
} from "@/lib/conflicts";
import type { SessionDoc } from "@/lib/sessions-data";
import type { RelationDoc } from "@/lib/relations-data";
import type { Course } from "@/lib/courses-data";
import type { Tournament } from "@/lib/tournaments-data";
import type { ClubEvent } from "@/lib/events-data";

/** The enrolment relations that book a player's time. A league is not scheduled. */
const ENROLMENT_KINDS: RelationDoc["kind"][] = [
  "player_course",
  "player_tournament",
  "player_event",
];

/**
 * Reads the live schedule (sessions + parents + enrolment relations) and hands
 * back a pure `check` that a create/edit modal calls with its draft sessions to
 * find every player already booked during those meetings. Unlike the room/coach
 * warnings from `useDraftConflicts`, this one is BLOCKING: a busy player cannot
 * be enroled, so the result maps a player id straight to the Hebrew reason the
 * picker greys the row out with. All Firestore access stays here.
 */
export function usePlayerConflicts() {
  const { data: sessions } = useCollection<SessionDoc>("sessions");
  const { data: relations } = useCollection<RelationDoc>("relations");
  const { data: courses } = useCollection<Course>("courses");
  const { data: tournaments } = useCollection<Tournament>("tournaments");
  const { data: events } = useCollection<ClubEvent>("events");

  /** playerId → why they are unavailable, e.g. `תפוס 16:30–17:30 ב״חוג גן״`. */
  const check = useCallback(
    (draftSessions: SessionDoc[]): Record<string, string> => {
      // Active parents only — being "busy" in an archived activity is moot.
      const activeParents = new Set<string>([
        ...courses.filter((c) => c.status !== "ארכיון").map((c) => c.id),
        ...tournaments.filter((t) => t.status !== "ארכיון").map((t) => t.id),
        ...events.filter((e) => e.status !== "ארכיון").map((e) => e.id),
      ]);

      // Enrolled players per activity, from the relations junction.
      const playersByParent = new Map<string, string[]>();
      for (const rel of relations) {
        if (!ENROLMENT_KINDS.includes(rel.kind)) continue;
        const list = playersByParent.get(rel.targetId);
        if (list) list.push(rel.subjectId);
        else playersByParent.set(rel.targetId, [rel.subjectId]);
      }

      // Look a year ahead so future recurrences surface with a concrete date,
      // while open-ended series stay bounded.
      const now = new Date();
      const rangeStart = toISODate(now);
      const rangeEnd = toISODate(addMonths(now, 12));

      const busy = busyPlayers(
        draftSessions,
        sessions,
        (parentId) => playersByParent.get(parentId) ?? [],
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

      return Object.fromEntries(
        [...busy].map(([playerId, info]) => [playerId, playerBusyLabel(info)]),
      );
    },
    [sessions, relations, courses, tournaments, events],
  );

  return { check };
}
