import type { Course } from "@/lib/courses-data";

/**
 * A player's / coach's חוגים registration lives in the `relations` collection as
 * a list of course names. These helpers resolve those names against the LIVE
 * courses list (read from Firestore by the caller) so the registration modal can
 * show rich details (coach, days, room, …).
 */

/** The courses currently registered to, in the given roster order. */
export function registeredCoursesFor(
  courseNames: string[],
  allCourses: Course[],
): Course[] {
  return courseNames
    .map((name) => allCourses.find((c) => c.name === name))
    .filter((c): c is Course => c != null);
}

/** Active courses not yet registered to (candidates to add). */
export function availableCoursesFor(
  courseNames: string[],
  allCourses: Course[],
): Course[] {
  return allCourses.filter(
    (c) => c.status !== "לא פעיל" && !courseNames.includes(c.name),
  );
}
