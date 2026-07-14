import { useMemo } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import { useEquipmentFilter } from "@/hooks/rooms/useEquipmentFilter";
import type { Equipment } from "@/lib/rooms-data";

/**
 * Drives the equipment page: the list is read live from Firestore and fed into
 * the search/filter hook. `equipment` is the full live list (for the action
 * modals); `filterKey` re-triggers the table animation.
 */
export function useEquipmentPanel() {
  const { data: equipment, loading } = useCollection<Equipment>("equipment");
  const filter = useEquipmentFilter(equipment);
  const filterKey = useMemo(
    () => JSON.stringify({ search: filter.search, filters: filter.filters }),
    [filter.search, filter.filters],
  );
  return { ...filter, equipment, total: equipment.length, filterKey, loading };
}
