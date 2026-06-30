import { leagueTeams } from "@/lib/leagues-data";

/** A player in the league roster, optionally already assigned to a league team. */
export interface RosterPlayer {
  id: string;
  name: string;
  rating: number;
  /** The league team the player currently belongs to, or null for a free agent. */
  teamId: string | null;
}

/** Team name lookup, used to label a player that already sits in another team. */
export const leagueTeamNameById: Record<string, string> = Object.fromEntries(
  leagueTeams.map((t) => [t.id, t.name]),
);

// The roster is every player already placed on a team, plus a handful of free
// agents available to be drafted. Mock data — enough to see the flow.
export const leagueRoster: RosterPlayer[] = [
  ...leagueTeams.flatMap((team) =>
    team.players.map((p) => ({
      id: p.id,
      name: p.name,
      rating: p.rating,
      teamId: team.id,
    })),
  ),
  { id: "fa-1", name: "אלעד שמיר", rating: 1995, teamId: null },
  { id: "fa-2", name: "רועי בן חיים", rating: 1840, teamId: null },
  { id: "fa-3", name: "נטע אלון", rating: 1720, teamId: null },
  { id: "fa-4", name: "עידו פלד", rating: 1610, teamId: null },
  { id: "fa-5", name: "מאיה גורן", rating: 2010, teamId: null },
  { id: "fa-6", name: "יובל אשד", rating: 1555, teamId: null },
];

const rosterById: Record<string, RosterPlayer> = Object.fromEntries(
  leagueRoster.map((p) => [p.id, p]),
);

export function rosterPlayer(id: string): RosterPlayer | undefined {
  return rosterById[id];
}
