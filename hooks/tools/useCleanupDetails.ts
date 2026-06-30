"use client";

import { useAddCourse } from "@/hooks/courses/useAddCourse";
import { useAddTournament } from "@/hooks/tournaments/useAddTournament";
import { useAddEvent } from "@/hooks/events/useAddEvent";
import { courses } from "@/lib/courses-data";
import { tournaments } from "@/lib/tournaments-data";
import { events } from "@/lib/events-data";
import { courseFormValuesFor } from "@/lib/course-details";
import { tournamentFormValuesFor } from "@/lib/tournament-details";
import { eventFormValuesFor } from "@/lib/event-details";
import type { CompletedCourse } from "@/lib/cleanup-data";

/**
 * Opens the *real* details view for a completed course by reusing the same
 * prefilled form modals the rest of the app uses (חוג / תחרות / אירוע), rather
 * than a plain data dialog. The cleanup archive is read-only, so the modals are
 * opened in "view" mode — the data may be inspected but not edited.
 */
export function useCleanupDetails() {
  const courseForm = useAddCourse();
  const tournamentForm = useAddTournament();
  const eventForm = useAddEvent();

  function open(item: CompletedCourse) {
    if (item.kind === "חוג") {
      const course = courses.find((a) => a.id === item.id);
      if (course) courseForm.openForView(courseFormValuesFor(course));
    } else if (item.kind === "תחרות") {
      const tournament = tournaments.find((t) => t.id === item.id);
      if (tournament)
        tournamentForm.openForView(tournamentFormValuesFor(tournament));
    } else {
      const event = events.find((e) => e.id === item.id);
      if (event) eventForm.openForView(eventFormValuesFor(event));
    }
  }

  return { open, courseForm, tournamentForm, eventForm };
}
