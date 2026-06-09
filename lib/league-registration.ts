import { leagueTeams, type LeagueTeam } from "@/lib/leagues-data";

/**
 * A player's ליגה registration lives on `Player.leagueTeam` as a single team
 * name (or `null` when unregistered). These helpers resolve that name against
 * the full `leagueTeams` data so the registration modal can show rich details
 * (category, rank, notes, roster size).
 */

/** The league team a player is currently registered to, or null. */
export function registeredLeagueTeamFor(
  teamName: string | null,
): LeagueTeam | null {
  if (!teamName) return null;
  return leagueTeams.find((t) => t.name === teamName) ?? null;
}

/** League teams the player is not already on (candidates to register to). */
export function availableLeagueTeamsFor(teamName: string | null): LeagueTeam[] {
  return leagueTeams.filter((t) => t.name !== teamName);
}
