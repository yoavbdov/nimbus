import type { Player } from "@/lib/players-data";
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
 * Whether a value sits inside an [min, max] range where each side is optional:
 * a falsy bound (empty / 0 / null) imposes no limit on that side. So leaving a
 * criterion blank means "not limited", exactly as authored in the form.
 */
function withinRange(
  value: number,
  min: number | null | undefined,
  max: number | null | undefined,
): boolean {
  if (min && value < min) return false;
  if (max && value > max) return false;
  return true;
}

/** Project a live player doc onto the columns the enrollments table shows. */
function toCandidate(p: Player): EnrollmentCandidate {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    grade: p.grade,
    israeliRating: p.israeliRating,
    phone: p.phone,
  };
}

/**
 * The players who could be enrolled in the given course, chosen from the LIVE
 * roster: within the course's age and rating ranges (each honoured only when
 * that range isn't "no limit"), excluding those already enrolled (`enrolledIds`
 * — the `player_course` links, resolved by the caller from `relations`).
 */
export function possibleEnrollments(
  course: Course,
  players: Player[],
  enrolledIds: Set<string>,
): EnrollmentCandidate[] {
  return players
    .filter(
      (p) =>
        (course.noAgeLimit ||
          withinRange(p.age, course.ageMin, course.ageMax)) &&
        (course.noRatingLimit ||
          withinRange(p.israeliRating, course.ratingMin, course.ratingMax)) &&
        !enrolledIds.has(p.id),
    )
    .map(toCandidate);
}

/**
 * The players who could be registered to the given tournament, chosen from the
 * LIVE roster: within its age and rating ranges (each honoured only when that
 * range isn't "no limit"), excluding those already registered (`enrolledIds` —
 * the `player_tournament` links, resolved by the caller from `relations`).
 */
export function possibleTournamentEnrollments(
  tournament: Tournament,
  players: Player[],
  enrolledIds: Set<string>,
): EnrollmentCandidate[] {
  return players
    .filter(
      (p) =>
        (tournament.noAgeLimit ||
          withinRange(p.age, tournament.ageMin, tournament.ageMax)) &&
        (tournament.noRatingLimit ||
          withinRange(
            p.israeliRating,
            tournament.ratingMin,
            tournament.ratingMax,
          )) &&
        !enrolledIds.has(p.id),
    )
    .map(toCandidate);
}
