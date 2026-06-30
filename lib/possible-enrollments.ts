import { players } from "@/lib/players-data";
import type { Course } from "@/lib/courses-data";
import type { Tournament } from "@/lib/tournaments-data";

/** A student who could join an course: free at its day/time and within its criteria. */
export interface EnrollmentCandidate {
  id: string;
  name: string;
  age: number;
  grade: string;
  israeliRating: number;
  phone: string;
}

/**
 * Returns the students who could be enrolled in the given course.
 *
 * NOTE: this is placeholder data — it filters the roster by the course's age
 * and fitness ranges so the table looks plausible. The real version will also
 * check that each student is free on the course's day and time.
 */
export function possibleEnrollments(course: Course): EnrollmentCandidate[] {
  return players
    .filter(
      (p) =>
        p.age >= course.ageMin &&
        p.age <= course.ageMax &&
        p.israeliRating >= course.fitnessMin &&
        p.israeliRating <= course.fitnessMax &&
        !p.clubs.includes(course.name),
    )
    .map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      grade: p.grade,
      israeliRating: p.israeliRating,
      phone: p.phone,
    }));
}

/**
 * Returns the players who could be registered to the given tournament.
 *
 * NOTE: placeholder data — it filters the roster by the tournament's rating
 * range (and drops players already registered) so the table looks plausible.
 */
export function possibleTournamentEnrollments(
  tournament: Tournament,
): EnrollmentCandidate[] {
  return players
    .filter(
      (p) =>
        p.israeliRating >= tournament.ratingMin &&
        p.israeliRating <= tournament.ratingMax &&
        !p.tournaments.includes(tournament.name),
    )
    .map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      grade: p.grade,
      israeliRating: p.israeliRating,
      phone: p.phone,
    }));
}
