import { useMemo } from "react";
import { usePlayersFilter } from "@/hooks/usePlayersFilter";
import { useRelationNames } from "@/hooks/relations/useRelationNames";
import { useCollection } from "@/lib/firebase/useCollection";
import type { Player } from "@/lib/players-data";
import type { FieldOptions } from "@/lib/players-filters";
import type { Course } from "@/lib/courses-data";
import type { Tournament } from "@/lib/tournaments-data";
import type { LeagueTeam } from "@/lib/leagues-data";

/** Sorted unique names from a live collection, for a filter's dropdown. */
function names<T extends { name: string }>(items: T[]): string[] {
  return Array.from(new Set(items.map((i) => i.name))).sort((a, b) =>
    a.localeCompare(b, "he"),
  );
}

/**
 * Drives the players page: the roster is read live from Firestore, each player
 * enriched with its course / tournament / league associations projected from
 * `relations`, then fed into the filter/search hook. `players` is the full live
 * list (for the action modals), `total` its size, `filterKey` re-triggers the
 * table animation.
 */
export function usePlayersPanel() {
  const { data: records, loading } = useCollection<Player>("players");
  const {
    playerCourses,
    playerTournaments,
    playerLeague,
    loading: relationsLoading,
  } = useRelationNames();

  const players = useMemo<Player[]>(
    () =>
      records.map((p) => ({
        ...p,
        courses: playerCourses.get(p.id) ?? [],
        tournaments: playerTournaments.get(p.id) ?? [],
        leagueTeam: playerLeague.get(p.id) ?? null,
      })),
    [records, playerCourses, playerTournaments, playerLeague],
  );

  // Live dropdown options for the חוג / תחרות / קבוצת ליגה filters, sourced from
  // the real collections (not the static mock) so a filter matches live data.
  const { data: courses } = useCollection<Course>("courses");
  const { data: tournaments } = useCollection<Tournament>("tournaments");
  const { data: leagues } = useCollection<LeagueTeam>("leagues");
  const filterOptions = useMemo<FieldOptions>(
    () => ({
      club: names(courses),
      tournament: names(tournaments),
      leagueTeam: names(leagues),
    }),
    [courses, tournaments, leagues],
  );

  const filter = usePlayersFilter(players);
  const filterKey = useMemo(
    () => JSON.stringify({ search: filter.search, filters: filter.filters }),
    [filter.search, filter.filters],
  );
  return {
    ...filter,
    players,
    total: players.length,
    loading: loading || relationsLoading,
    filterKey,
    filterOptions,
  };
}
