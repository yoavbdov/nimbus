import { useMemo } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import type { Player } from "@/lib/players-data";
import type { RatingPlayer } from "@/hooks/dashboard/useRatingPlayersTable";

const CURRENT_YEAR = new Date().getFullYear();

export interface DashboardPlayers {
  /** Full player records (live from Firestore) — drives the action modals. */
  players: Player[];
  /** Trimmed rows for the rating table: name / rating / birth year. */
  ratingPlayers: RatingPlayer[];
  loading: boolean;
}

/**
 * The dashboard roster, read live from Firestore. Feeds both the rating table
 * (all players) and the rating-distribution tiers, replacing the old static
 * `lib/dashboard-data` sample.
 */
export function useDashboardPlayers(): DashboardPlayers {
  const { data, loading } = useCollection<Player>("players");

  const ratingPlayers = useMemo<RatingPlayer[]>(
    () =>
      data.map((p) => ({
        name: p.name,
        rating: p.israeliRating,
        birthYear: CURRENT_YEAR - p.age,
      })),
    [data],
  );

  return { players: data, ratingPlayers, loading };
}
