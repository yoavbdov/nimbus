import { tournaments, type Tournament } from "@/lib/tournaments-data";

/**
 * A player's תחרויות registration lives on `Player.tournaments` as a list of
 * tournament names. These helpers resolve those names against the full
 * `tournaments` data so the registration modal can show rich details (judge,
 * days, room, …).
 */

/** The tournaments a player is currently registered to, in roster order. */
export function registeredTournamentsFor(tournamentNames: string[]): Tournament[] {
  return tournamentNames
    .map((name) => tournaments.find((t) => t.name === name))
    .filter((t): t is Tournament => t != null);
}

/** Active tournaments the player is not yet registered to (candidates to add). */
export function availableTournamentsFor(tournamentNames: string[]): Tournament[] {
  return tournaments.filter(
    (t) => t.status !== "הסתיימה" && !tournamentNames.includes(t.name),
  );
}
