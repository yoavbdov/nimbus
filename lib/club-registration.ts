import { courses, type Course } from "@/lib/courses-data";

/**
 * A player's חוגים registration lives on `Player.clubs` as a list of course
 * names. These helpers resolve those names against the full `courses` data
 * so the registration modal can show rich details (coach, days, room, …).
 */

/** The courses a player is currently registered to, in roster order. */
export function registeredClubsFor(clubNames: string[]): Course[] {
  return clubNames
    .map((name) => courses.find((a) => a.name === name))
    .filter((a): a is Course => a != null);
}

/** Active courses the player is not yet registered to (candidates to add). */
export function availableClubsFor(clubNames: string[]): Course[] {
  return courses.filter(
    (a) => a.status !== "לא פעיל" && !clubNames.includes(a.name),
  );
}
