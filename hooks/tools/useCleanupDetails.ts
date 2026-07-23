"use client";

import { useAddCourse } from "@/hooks/courses/useAddCourse";
import { useAddTournament } from "@/hooks/tournaments/useAddTournament";
import { useAddEvent } from "@/hooks/events/useAddEvent";
import { useCollection } from "@/lib/firebase/useCollection";
import { courseFormValuesFromLive } from "@/lib/course-details";
import { tournamentFormValuesFromLive } from "@/lib/tournament-details";
import { eventFormValuesFromLive } from "@/lib/event-details";
import type { CompletedCourse } from "@/lib/cleanup-data";
import type { Course } from "@/lib/courses-data";
import type { Tournament } from "@/lib/tournaments-data";
import type { ClubEvent } from "@/lib/events-data";
import type { SessionDoc } from "@/lib/sessions-data";
import type { RelationDoc } from "@/lib/relations-data";

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
  // Every archived activity is read live from Firestore, together with its
  // meetings (`sessions`) and associations (`relations`).
  const { data: courses } = useCollection<Course>("courses");
  const { data: tournaments } = useCollection<Tournament>("tournaments");
  const { data: events } = useCollection<ClubEvent>("events");
  const { data: sessions } = useCollection<SessionDoc>("sessions");
  const { data: relations } = useCollection<RelationDoc>("relations");

  function open(item: CompletedCourse) {
    if (item.kind === "חוג") {
      const course = courses.find((a) => a.id === item.id);
      if (course)
        courseForm.openForView(
          courseFormValuesFromLive(course, sessions, relations),
        );
    } else if (item.kind === "תחרות") {
      const tournament = tournaments.find((t) => t.id === item.id);
      if (tournament)
        tournamentForm.openForView(
          tournamentFormValuesFromLive(tournament, sessions, relations),
        );
    } else {
      const event = events.find((e) => e.id === item.id);
      if (event)
        eventForm.openForView(
          eventFormValuesFromLive(event, sessions, relations),
        );
    }
  }

  return { open, courseForm, tournamentForm, eventForm };
}
