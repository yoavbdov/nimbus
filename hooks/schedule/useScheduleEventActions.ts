import { useCallback, useState } from "react";
import { useAddActivity } from "@/hooks/activities/useAddActivity";
import { usePossibleEnrollments } from "@/hooks/activities/usePossibleEnrollments";
import { useAddTournament } from "@/hooks/tournaments/useAddTournament";
import { usePossibleTournamentEnrollments } from "@/hooks/tournaments/usePossibleTournamentEnrollments";
import { useAddEvent } from "@/hooks/events/useAddEvent";
import { useLeagueTeamDetails } from "@/hooks/leagues/useLeagueTeamDetails";
import { useAddCoach } from "@/hooks/coaches/useAddCoach";
import { useArchiveConfirm } from "@/hooks/useArchiveConfirm";
import { activityFormValuesFor } from "@/lib/activity-details";
import { tournamentFormValuesFor } from "@/lib/tournament-details";
import { eventFormValuesFor } from "@/lib/event-details";
import { coachFormValuesFor } from "@/lib/coach-details";
import { activities } from "@/lib/activities-data";
import { tournaments } from "@/lib/tournaments-data";
import { events as clubEvents } from "@/lib/events-data";
import { leagueTeams } from "@/lib/leagues-data";
import { coaches } from "@/lib/coaches-data";
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
  const activityEdit = useAddActivity();
  const activityEnrollments = usePossibleEnrollments();
  const tournamentEdit = useAddTournament();
  const tournamentEnrollments = usePossibleTournamentEnrollments();
  const eventEdit = useAddEvent();
  const leagueDetails = useLeagueTeamDetails();
  const coachEdit = useAddCoach();
  const archive = useArchiveConfirm();
  const [archiveNoun, setArchiveNoun] = useState("פעילויות");

  const dispatch = useCallback(
    (event: ScheduleEvent, actionId: string) => {
      switch (event.category) {
        case "חוג": {
          const activity = pickByTitle(activities, event.title);
          if (actionId === "details") {
            activityEdit.openForEdit(activityFormValuesFor(activity));
          } else if (actionId === "coach") {
            const coach = coaches.find((c) => c.name === activity.coach);
            if (coach) coachEdit.openForEdit(coachFormValuesFor(coach));
          } else if (actionId === "enrollments") {
            activityEnrollments.openFor(activity);
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
      activityEdit,
      activityEnrollments,
      tournamentEdit,
      tournamentEnrollments,
      eventEdit,
      leagueDetails,
      coachEdit,
      archive,
    ],
  );

  return {
    dispatch,
    activityEdit,
    activityEnrollments,
    tournamentEdit,
    tournamentEnrollments,
    eventEdit,
    leagueDetails,
    coachEdit,
    archive,
    archiveNoun,
  };
}
