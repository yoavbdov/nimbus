import { useMemo } from "react";
import { usePlayersFilter } from "@/hooks/usePlayersFilter";
import { useCollection } from "@/lib/firebase/useCollection";
import type { Player } from "@/lib/players-data";

/**
 * Drives the players page: the roster is read live from Firestore and fed into
 * the filter/search hook. `players` is the full live list (for the action
 * modals), `total` its size, and `filterKey` re-triggers the table animation.
 */
export function usePlayersPanel() {
  const { data: players, loading } = useCollection<Player>("players");
  const filter = usePlayersFilter(players);
  const filterKey = useMemo(
    () => JSON.stringify({ search: filter.search, filters: filter.filters }),
    [filter.search, filter.filters],
  );
  return { ...filter, players, total: players.length, loading, filterKey };
}
