import { clubPlayers } from "@/lib/rosters-data";

// ── Bulk fitness update ────────────────────────────────────────────
// The data behind the "עדכון מד כושר מרוכז" tool: every club player with
// their current fitness rating and when it was last updated. Mock data —
// the table only collects new values, it does not persist anything yet.

export interface FitnessPlayer {
  id: string;
  name: string;
  currentRating: number;
  /** Formatted dd.MM.yyyy — when the fitness rating was last updated. */
  lastUpdated: string;
}

// "Today" in the mock app, used to spread the last-updated dates behind us.
const BASE = new Date(2026, 5, 16);

/** Deterministic "last updated" date per player so the demo table is stable. */
function lastUpdatedFor(seed: string): string {
  const hash = [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const daysAgo = 7 + (hash % 120);
  const d = new Date(BASE);
  d.setDate(d.getDate() - daysAgo);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export const fitnessPlayers: FitnessPlayer[] = clubPlayers.map((p) => ({
  id: p.id,
  name: p.name,
  currentRating: p.rating,
  lastUpdated: lastUpdatedFor(p.id),
}));
