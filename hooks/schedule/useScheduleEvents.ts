import { useMemo } from "react";
import { addDays, addMonths, startOfMonth, toISODate } from "@/lib/calendar";
import { useCollection } from "@/lib/firebase/useCollection";
import {
  scheduleEventsFromSessions,
  type ParentMeta,
} from "@/lib/schedule-events";
import type { ScheduleEvent } from "@/lib/schedule-data";
import type { SessionDoc } from "@/lib/sessions-data";
import type { Course } from "@/lib/courses-data";
import type { Tournament } from "@/lib/tournaments-data";
import type { ClubEvent } from "@/lib/events-data";
import type { RelationDoc } from "@/lib/relations-data";
import type { Room } from "@/lib/rooms-data";

/**
 * Reads the schedule live from Firestore and projects it into the flat
 * `ScheduleEvent` occurrences the calendar renders. Every occurrence traces back
 * to a real session + parent record, so edits round-trip to the same docs.
 *
 * Sessions are expanded across a three-month window centred on `viewMonth` (the
 * previous, current and next month), matching how far the picker can navigate
 * before the view refreshes. Archived / missing parents are dropped.
 */
export function useScheduleEvents(viewMonth: Date): ScheduleEvent[] {
  const { data: sessions } = useCollection<SessionDoc>("sessions");
  const { data: courses } = useCollection<Course>("courses");
  const { data: tournaments } = useCollection<Tournament>("tournaments");
  const { data: events } = useCollection<ClubEvent>("events");
  const { data: relations } = useCollection<RelationDoc>("relations");
  const { data: rooms } = useCollection<Room>("rooms");

  return useMemo(() => {
    const rangeStart = toISODate(startOfMonth(addMonths(viewMonth, -1)));
    const rangeEnd = toISODate(addDays(startOfMonth(addMonths(viewMonth, 2)), -1));

    // Parents by id (archived rows are excluded up front).
    const courseById = new Map(
      courses.filter((c) => c.status !== "ארכיון").map((c) => [c.id, c]),
    );
    const tournamentById = new Map(
      tournaments.filter((t) => t.status !== "ארכיון").map((t) => [t.id, t]),
    );
    const eventById = new Map(
      events.filter((e) => e.status !== "ארכיון").map((e) => [e.id, e]),
    );

    // The assigned coach of each course (its `coach_course` link).
    const coachByCourse = new Map<string, string>();
    // Enrolled player names per parent id, grouped by the enrolling relation.
    const playersByParent = new Map<string, string[]>();
    for (const rel of relations) {
      if (rel.kind === "coach_course") {
        coachByCourse.set(rel.targetId, rel.subjectId);
      } else if (
        rel.kind === "player_course" ||
        rel.kind === "player_tournament" ||
        rel.kind === "player_event"
      ) {
        const list = playersByParent.get(rel.targetId);
        if (list) list.push(rel.subjectId);
        else playersByParent.set(rel.targetId, [rel.subjectId]);
      }
    }

    // Room id/name → display name (docs are keyed by name; fall back to the id).
    const roomName = new Map<string, string>();
    for (const room of rooms) {
      roomName.set(room.id, room.name);
      roomName.set(room.name, room.name);
    }
    const roomNameOf = (roomId: string) => roomName.get(roomId) ?? roomId;

    const parentMetaOf = (session: SessionDoc): ParentMeta | null => {
      const players = playersByParent.get(session.parentId) ?? [];
      switch (session.parentType) {
        case "course": {
          const course = courseById.get(session.parentId);
          if (!course) return null;
          return {
            title: course.name,
            category: "חוג",
            coach: coachByCourse.get(course.id) ?? course.coach ?? "",
            players,
          };
        }
        case "tournament": {
          const tournament = tournamentById.get(session.parentId);
          if (!tournament) return null;
          return {
            title: tournament.name,
            category: "תחרות",
            coach: tournament.judge ?? "",
            players,
          };
        }
        case "event": {
          const clubEvent = eventById.get(session.parentId);
          if (!clubEvent) return null;
          return { title: clubEvent.name, category: "אירוע", coach: "", players };
        }
      }
    };

    return scheduleEventsFromSessions(
      sessions,
      parentMetaOf,
      roomNameOf,
      rangeStart,
      rangeEnd,
    );
  }, [sessions, courses, tournaments, events, relations, rooms, viewMonth]);
}
