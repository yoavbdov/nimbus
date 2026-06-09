import { players } from "@/lib/players-data";
import type { Activity } from "@/lib/activities-data";

/** A student who could join an activity: free at its day/time and within its criteria. */
export interface EnrollmentCandidate {
  id: string;
  name: string;
  age: number;
  grade: string;
  israeliRating: number;
  phone: string;
}

/**
 * Returns the students who could be enrolled in the given activity.
 *
 * NOTE: this is placeholder data — it filters the roster by the activity's age
 * and fitness ranges so the table looks plausible. The real version will also
 * check that each student is free on the activity's day and time.
 */
export function possibleEnrollments(activity: Activity): EnrollmentCandidate[] {
  return players
    .filter(
      (p) =>
        p.age >= activity.ageMin &&
        p.age <= activity.ageMax &&
        p.israeliRating >= activity.fitnessMin &&
        p.israeliRating <= activity.fitnessMax &&
        !p.clubs.includes(activity.name),
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
