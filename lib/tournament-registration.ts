import type { Tournament } from "@/lib/tournaments-data";

/**
 * A player's / coach's תחרויות registration lives in the `relations` collection
 * as a list of tournament names. These helpers resolve those names against the
 * LIVE tournaments list (read from Firestore by the caller) so the registration
 * modal can show rich details (judge, days, room, …).
 */

/** The tournaments currently registered to, in the given roster order. */
export function registeredTournamentsFor(
  tournamentNames: string[],
  allTournaments: Tournament[],
): Tournament[] {
  return tournamentNames
    .map((name) => allTournaments.find((t) => t.name === name))
    .filter((t): t is Tournament => t != null);
}

/** Active tournaments not yet registered to (candidates to add). */
export function availableTournamentsFor(
  tournamentNames: string[],
  allTournaments: Tournament[],
): Tournament[] {
  return allTournaments.filter(
    (t) => t.status !== "הסתיימה" && !tournamentNames.includes(t.name),
  );
}
