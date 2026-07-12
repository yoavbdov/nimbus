import { useCallback, useState } from "react";
import { useAddCourse } from "@/hooks/courses/useAddCourse";
import { usePossibleEnrollments } from "@/hooks/courses/usePossibleEnrollments";
import { useAddTournament } from "@/hooks/tournaments/useAddTournament";
import { usePossibleTournamentEnrollments } from "@/hooks/tournaments/usePossibleTournamentEnrollments";
import { useAddEvent } from "@/hooks/events/useAddEvent";
import { useLeagueTeamDetails } from "@/hooks/leagues/useLeagueTeamDetails";
import { useAddCoach } from "@/hooks/coaches/useAddCoach";
import { useArchiveConfirm } from "@/hooks/useArchiveConfirm";
import { courseFormValuesFor } from "@/lib/course-details";
import { tournamentFormValuesFor } from "@/lib/tournament-details";
import { eventFormValuesFor } from "@/lib/event-details";
import { coachFormValuesFor } from "@/lib/coach-details";
import { courses } from "@/lib/courses-data";
import { tournaments } from "@/lib/tournaments-data";
import { events as clubEvents } from "@/lib/events-data";
import { leagueTeams } from "@/lib/leagues-data";
import { useCollection } from "@/lib/firebase/useCollection";
import type { CoachRecord } from "@/lib/coaches-data";
import type { ScheduleEvent } from "@/lib/schedule-data";

/** A stable index from a title, so an unmatched event still resolves to a record. */
function indexFromTitle(title: string, length: number): number {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) | 0;
  return Math.abs(h) % length;
}

/** Resolve a schedule event to a real record: exact name match, else a stable pick. */
function pickByTitle<T extends { name: string }>(list: T[], title: string): T {
  return list.find((r) => r.name === title) ?? list[indexFromTitle(title, list.length)];
}

/**
 * Wires a clicked schedule event to the very same modals the management modules
 * open from their row dropdowns. Each schedule event is resolved to its real
 * record (by name), then the chosen action opens the matching flow.
 */
export function useScheduleEventActions() {
  const courseEdit = useAddCourse();
  const courseEnrollments = usePossibleEnrollments();
  const tournamentEdit = useAddTournament();
  const tournamentEnrollments = usePossibleTournamentEnrollments();
  const eventEdit = useAddEvent();
  const leagueDetails = useLeagueTeamDetails();
  const coachEdit = useAddCoach();
  // Read coaches live so an edited note round-trips the Firestore doc, not the
  // static mock roster.
  const { data: coaches } = useCollection<CoachRecord>("coaches");
  const archive = useArchiveConfirm();
  const [archiveNoun, setArchiveNoun] = useState("פעילויות");

  const dispatch = useCallback(
    (event: ScheduleEvent, actionId: string) => {
      switch (event.category) {
        case "חוג": {
          const course = pickByTitle(courses, event.title);
          if (actionId === "details") {
            courseEdit.openForEdit(courseFormValuesFor(course));
          } else if (actionId === "coach") {
            const coach = coaches.find((c) => c.name === course.coach);
            if (coach) coachEdit.openForEdit(coachFormValuesFor(coach));
          } else if (actionId === "enrollments") {
            courseEnrollments.openFor(course);
          } else if (actionId === "archive") {
            setArchiveNoun("חוגים");
            archive.openFor(1);
          }
          break;
        }
        case "תחרות": {
          const tournament = pickByTitle(tournaments, event.title);
          if (actionId === "details") {
            tournamentEdit.openForEdit(tournamentFormValuesFor(tournament));
          } else if (actionId === "judge") {
            const coach = coaches.find((c) => c.name === tournament.judge);
            if (coach) coachEdit.openForEdit(coachFormValuesFor(coach));
          } else if (actionId === "enrollments") {
            tournamentEnrollments.openFor(tournament);
          } else if (actionId === "archive") {
            setArchiveNoun("תחרויות");
            archive.openFor(1);
          }
          break;
        }
        case "אירוע": {
          const clubEvent = pickByTitle(clubEvents, event.title);
          if (actionId === "details") {
            eventEdit.openForEdit(eventFormValuesFor(clubEvent));
          } else if (actionId === "archive") {
            setArchiveNoun("אירועים");
            archive.openFor(1);
          }
          break;
        }
        case "ליגה": {
          const team = pickByTitle(leagueTeams, event.title);
          if (actionId === "details") leagueDetails.openFor(team, "details");
          else if (actionId === "players") leagueDetails.openFor(team, "players");
          break;
        }
      }
    },
    [
      courseEdit,
      courseEnrollments,
      tournamentEdit,
      tournamentEnrollments,
      eventEdit,
      leagueDetails,
      coachEdit,
      coaches,
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
