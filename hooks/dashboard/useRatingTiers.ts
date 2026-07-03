import { useMemo } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import { updateRatingTier } from "@/lib/firebase/data/ratingTiers";
import type { RatingTier } from "@/lib/rating-tiers-data";

export interface UseRatingTiers {
  tiers: RatingTier[];
  loading: boolean;
  /** Persist a label/range edit for one tier to Firestore. */
  handleTierChange: (id: string, patch: Partial<Omit<RatingTier, "id">>) => void;
}

/**
 * The dashboard rating bands, read live from Firestore and sorted by `order`.
 * Edits to a tier's label or range are written straight back to the DB.
 */
export function useRatingTiers(): UseRatingTiers {
  const { data, loading } = useCollection<RatingTier>("ratingTiers");

  const tiers = useMemo(
    () => [...data].sort((a, b) => a.order - b.order),
    [data],
  );

  function handleTierChange(
    id: string,
    patch: Partial<Omit<RatingTier, "id">>,
  ) {
    void updateRatingTier(id, patch);
  }

  return { tiers, loading, handleTierChange };
}
