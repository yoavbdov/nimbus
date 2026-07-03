import { useMemo } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import { useRelationNames } from "@/hooks/relations/useRelationNames";
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
  const {
    playerCourses,
    playerTournaments,
    playerLeague,
    loading: relationsLoading,
  } = useRelationNames();

  const players = useMemo<Player[]>(
    () =>
      data.map((p) => ({
        ...p,
        courses: playerCourses.get(p.id) ?? [],
        tournaments: playerTournaments.get(p.id) ?? [],
        leagueTeam: playerLeague.get(p.id) ?? null,
      })),
    [data, playerCourses, playerTournaments, playerLeague],
  );

  const ratingPlayers = useMemo<RatingPlayer[]>(
    () =>
      players.map((p) => ({
        name: p.name,
        rating: p.israeliRating,
        birthYear: CURRENT_YEAR - p.age,
      })),
    [players],
  );

  return { players, ratingPlayers, loading: loading || relationsLoading };
}
