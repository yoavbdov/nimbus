"use client";

import { useAddActivity } from "@/hooks/activities/useAddActivity";
import { useAddTournament } from "@/hooks/tournaments/useAddTournament";
import { useAddEvent } from "@/hooks/events/useAddEvent";
import { activities } from "@/lib/activities-data";
import { tournaments } from "@/lib/tournaments-data";
import { events } from "@/lib/events-data";
import { activityFormValuesFor } from "@/lib/activity-details";
import { tournamentFormValuesFor } from "@/lib/tournament-details";
import { eventFormValuesFor } from "@/lib/event-details";
import type { CompletedActivity } from "@/lib/cleanup-data";

/**
 * Opens the *real* details view for a completed activity by reusing the same
 * prefilled form modals the rest of the app uses (חוג / תחרות / אירוע), rather
 * than a plain data dialog.
 */
export function useCleanupDetails() {
  const activityForm = useAddActivity();
  const tournamentForm = useAddTournament();
  const eventForm = useAddEvent();

  function open(item: CompletedActivity) {
    if (item.kind === "חוג") {
      const activity = activities.find((a) => a.id === item.id);
      if (activity) activityForm.openForEdit(activityFormValuesFor(activity));
    } else if (item.kind === "תחרות") {
      const tournament = tournaments.find((t) => t.id === item.id);
      if (tournament)
        tournamentForm.openForEdit(tournamentFormValuesFor(tournament));
    } else {
      const event = events.find((e) => e.id === item.id);
      if (event) eventForm.openForEdit(eventFormValuesFor(event));
    }
  }

  return { open, activityForm, tournamentForm, eventForm };
}
