import { useCallback, useState } from "react";
import { useAddCourse } from "@/hooks/courses/useAddCourse";
import { usePossibleEnrollments } from "@/hooks/courses/usePossibleEnrollments";
import { useAddTournament } from "@/hooks/tournaments/useAddTournament";
import { usePossibleTournamentEnrollments } from "@/hooks/tournaments/usePossibleTournamentEnrollments";
import { useAddEvent } from "@/hooks/events/useAddEvent";
import { useLeagueTeamDetails } from "@/hooks/leagues/useLeagueTeamDetails";
import { useAddCoach } from "@/hooks/coaches/useAddCoach";
import { useArchiveConfirm } from "@/hooks/useArchiveConfirm";
import { courseFormValuesFromLive } from "@/lib/course-details";
import { tournamentFormValuesFromLive } from "@/lib/tournament-details";
import { eventFormValuesFromLive } from "@/lib/event-details";
import { coachFormValuesFor } from "@/lib/coach-details";
import { archiveCourse } from "@/lib/firebase/data/courses";
import { archiveTournament } from "@/lib/firebase/data/tournaments";
import { archiveEvent } from "@/lib/firebase/data/events";
import { useCollection } from "@/lib/firebase/useCollection";
import type { CoachRecord } from "@/lib/coaches-data";
import type { Course } from "@/lib/courses-data";
import type { Tournament } from "@/lib/tournaments-data";
import type { ClubEvent } from "@/lib/events-data";
import type { SessionDoc } from "@/lib/sessions-data";
import type { RelationDoc } from "@/lib/relations-data";
import type { ScheduleEvent } from "@/lib/schedule-data";

/**
 * Wires a clicked schedule occurrence to the very same modals the management
 * modules open from their row dropdowns. Every occurrence carries the real
 * `parentId`, so the record is resolved by id from live Firestore — the edit
 * flows prefill from (and save back to) the exact same docs, and "archive"
 * flips the parent's status in Firestore.
 */
export function useScheduleEventActions() {
  const courseEdit = useAddCourse();
  const courseEnrollments = usePossibleEnrollments();
  const tournamentEdit = useAddTournament();
  const tournamentEnrollments = usePossibleTournamentEnrollments();
  const eventEdit = useAddEvent();
  const leagueDetails = useLeagueTeamDetails();
  const coachEdit = useAddCoach();
  // Everything is read live so an edit round-trips the Firestore docs, never a
  // static mock: the parent records, plus the sessions + relations the edit
  // forms prefill from.
  const { data: courses } = useCollection<Course>("courses");
  const { data: tournaments } = useCollection<Tournament>("tournaments");
  const { data: clubEvents } = useCollection<ClubEvent>("events");
  const { data: sessions } = useCollection<SessionDoc>("sessions");
  const { data: relations } = useCollection<RelationDoc>("relations");
  const { data: coaches } = useCollection<CoachRecord>("coaches");
  const archive = useArchiveConfirm();
  const [archiveNoun, setArchiveNoun] = useState("פעילויות");

  const dispatch = useCallback(
    (event: ScheduleEvent, actionId: string) => {
      switch (event.category) {
        case "חוג": {
          const course = courses.find((c) => c.id === event.parentId);
          if (!course) break;
          if (actionId === "details") {
            courseEdit.openForEdit(
              courseFormValuesFromLive(course, sessions, relations),
            );
          } else if (actionId === "coach") {
            const coach = coaches.find((c) => c.name === course.coach);
            if (coach) coachEdit.openForEdit(coachFormValuesFor(coach));
          } else if (actionId === "enrollments") {
            courseEnrollments.openFor(course);
          } else if (actionId === "archive") {
            setArchiveNoun("חוגים");
            archive.openFor(1, {
              names: [course.name],
              onConfirm: () => void archiveCourse(course.id),
            });
          }
          break;
        }
        case "תחרות": {
          const tournament = tournaments.find((t) => t.id === event.parentId);
          if (!tournament) break;
          if (actionId === "details") {
            tournamentEdit.openForEdit(
              tournamentFormValuesFromLive(tournament, sessions, relations),
            );
          } else if (actionId === "judge") {
            const coach = coaches.find((c) => c.name === tournament.judge);
            if (coach) coachEdit.openForEdit(coachFormValuesFor(coach));
          } else if (actionId === "enrollments") {
            tournamentEnrollments.openFor(tournament);
          } else if (actionId === "archive") {
            setArchiveNoun("תחרויות");
            archive.openFor(1, {
              names: [tournament.name],
              onConfirm: () => void archiveTournament(tournament.id),
            });
          }
          break;
        }
        case "אירוע": {
          const clubEvent = clubEvents.find((e) => e.id === event.parentId);
          if (!clubEvent) break;
          if (actionId === "details") {
            eventEdit.openForEdit(
              eventFormValuesFromLive(clubEvent, sessions, relations),
            );
          } else if (actionId === "archive") {
            setArchiveNoun("אירועים");
            archive.openFor(1, {
              names: [clubEvent.name],
              onConfirm: () => void archiveEvent(clubEvent.id),
            });
          }
          break;
        }
      }
    },
    [
      courses,
      tournaments,
      clubEvents,
      sessions,
      relations,
      coaches,
      courseEdit,
      courseEnrollments,
      tournamentEdit,
      tournamentEnrollments,
      eventEdit,
      coachEdit,
      archive,
    ],
  );

  return {
    dispatch,
    courseEdit,
    courseEnrollments,
    tournamentEdit,
    tournamentEnrollments,
    eventEdit,
    leagueDetails,
    coachEdit,
    archive,
    archiveNoun,
  };
}
