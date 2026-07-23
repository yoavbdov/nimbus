import type { Player } from "@/lib/players-data";

// ── Rosters ────────────────────────────────────────────────────────
// A roster is a named list of players, stored in Firestore under
// `clubs/{clubId}/rosters`. The document holds only the list's name — its
// members live in the `relations` junction as `player_roster` links, like every
// other association in the app. Member rows (name + rating) are therefore
// projected from the LIVE players collection at read time, so a rating change or
// a renamed player is reflected in every roster automatically.

export interface RosterPlayer {
  id: string;
  name: string;
  rating: number;
}

/** A roster document as stored in Firestore (members are NOT embedded). */
export interface RosterDoc {
  id: string;
  name: string;
}

/** A roster with its members projected in — what the UI works with. */
export interface SavedRoster {
  id: string;
  name: string;
  players: RosterPlayer[];
}

/** Narrows a live player to the fields a roster row needs. */
export function toRosterPlayer(p: Player): RosterPlayer {
  return { id: p.id, name: p.name, rating: p.israeliRating };
}
