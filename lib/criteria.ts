import type { Player } from "@/lib/players-data";

/**
 * The age / fitness bounds an activity (course or tournament) can impose on the
 * players it enrolls. Bounds arrive as raw form strings — a blank string means
 * "no limit".
 */
export interface CriteriaBounds {
  ageMin: string;
  ageMax: string;
  fitnessMin: string;
  fitnessMax: string;
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
  const ageMin = bounds.ageMin ? Number(bounds.ageMin) : null;
  const ageMax = bounds.ageMax ? Number(bounds.ageMax) : null;
  const fitMin = bounds.fitnessMin ? Number(bounds.fitnessMin) : null;
  const fitMax = bounds.fitnessMax ? Number(bounds.fitnessMax) : null;

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
