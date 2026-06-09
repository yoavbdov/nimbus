import { activities, type Activity } from "@/lib/activities-data";

/**
 * A player's חוגים registration lives on `Player.clubs` as a list of activity
 * names. These helpers resolve those names against the full `activities` data
 * so the registration modal can show rich details (coach, days, room, …).
 */

/** The activities a player is currently registered to, in roster order. */
export function registeredClubsFor(clubNames: string[]): Activity[] {
  return clubNames
    .map((name) => activities.find((a) => a.name === name))
    .filter((a): a is Activity => a != null);
}

/** Active activities the player is not yet registered to (candidates to add). */
export function availableClubsFor(clubNames: string[]): Activity[] {
  return activities.filter(
    (a) => a.status !== "לא פעיל" && !clubNames.includes(a.name),
  );
}
