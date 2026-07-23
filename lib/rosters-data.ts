import type { Player } from "@/lib/players-data";

// ── Rosters ────────────────────────────────────────────────────────
// A roster is a named list of players. The three "prepared" lists below are not
// stored anywhere — they are derived on the fly from the LIVE player roster by a
// membership rule, so they always reflect what is currently in Firestore.

export interface RosterPlayer {
  id: string;
  name: string;
  rating: number;
}

/** A roster the user explicitly saved, kept in memory for this session. */
export interface SavedRoster {
  id: string;
  name: string;
  /** Where the list originally came from (only on the prepared lists). */
  sourceName?: string;
  players: RosterPlayer[];
}

/** Narrows a live player to the fields a roster row needs. */
export function toRosterPlayer(p: Player): RosterPlayer {
  return { id: p.id, name: p.name, rating: p.israeliRating };
}

// ── Prepared rosters ───────────────────────────────────────────────
// Offered as a source when adding people to a חוג, תחרות or אירוע. Each one is
// a rule over the live roster rather than a stored list, so a player who meets
// the rule is always in it and no names are hard-coded.

const PREPARED_ROSTER_RULES: {
  id: string;
  name: string;
  matches: (p: Player) => boolean;
}[] = [
  {
    id: "roster-rating-to-800",
    name: "מד כושר עד 800",
    matches: (p) => p.israeliRating <= 800,
  },
  {
    id: "roster-rating-over-1800",
    name: "מד כושר מעל 1800",
    matches: (p) => p.israeliRating > 1800,
  },
  {
    id: "roster-age-to-18",
    name: "גיל עד 18",
    matches: (p) => p.age <= 18,
  },
];

/**
 * The prepared lists for a given live roster, members sorted by rating (highest
 * first). An empty roster simply yields three empty lists.
 */
export function buildPreparedRosters(livePlayers: Player[]): SavedRoster[] {
  return PREPARED_ROSTER_RULES.map((rule) => ({
    id: rule.id,
    name: rule.name,
    sourceName: "רשימה מוכנה",
    players: livePlayers
      .filter(rule.matches)
      .sort((a, b) => b.israeliRating - a.israeliRating)
      .map(toRosterPlayer),
  }));
}
