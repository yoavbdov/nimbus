import type { Player } from "@/lib/players-data";

/**
 * The age / rating bounds an activity (course or tournament) can impose on the
 * players it enrolls. Bounds arrive as raw form strings — a blank string means
 * "no limit".
 */
export interface CriteriaBounds {
  ageMin: string;
  ageMax: string;
  ratingMin: string;
  ratingMax: string;
  /** When set, the matching range imposes no limit (its min/max are ignored). */
  noAgeLimit?: boolean;
  noRatingLimit?: boolean;
}

/**
 * Whether a max bound is set below its matching min bound (e.g. a maximum age
 * lower than the minimum age) — an impossible range the form must reject. Blank
 * bounds impose no limit, so a missing side is never invalid.
 */
export function maxBelowMin(min: string, max: string): boolean {
  if (min === "" || max === "") return false;
  return Number(max) < Number(min);
}

/**
 * The concrete reasons a player falls outside an activity's criteria, phrased in
 * Hebrew for display (e.g. "גיל 12 מתחת למינימום 14"). An empty array means the
 * player meets every bound.
 */
export function criteriaMismatchReasons(
  player: Player,
  bounds: CriteriaBounds,
): string[] {
  const ageMin = bounds.noAgeLimit || !bounds.ageMin ? null : Number(bounds.ageMin);
  const ageMax = bounds.noAgeLimit || !bounds.ageMax ? null : Number(bounds.ageMax);
  const fitMin =
    bounds.noRatingLimit || !bounds.ratingMin ? null : Number(bounds.ratingMin);
  const fitMax =
    bounds.noRatingLimit || !bounds.ratingMax ? null : Number(bounds.ratingMax);

  const reasons: string[] = [];
  if (ageMin != null && player.age < ageMin)
    reasons.push(`גיל ${player.age} מתחת למינימום ${ageMin}`);
  if (ageMax != null && player.age > ageMax)
    reasons.push(`גיל ${player.age} מעל למקסימום ${ageMax}`);
  if (fitMin != null && player.israeliRating < fitMin)
    reasons.push(`מד כושר ${player.israeliRating} מתחת למינימום ${fitMin}`);
  if (fitMax != null && player.israeliRating > fitMax)
    reasons.push(`מד כושר ${player.israeliRating} מעל למקסימום ${fitMax}`);
  return reasons;
}
