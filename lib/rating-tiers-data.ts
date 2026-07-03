/**
 * Rating tiers shown on the dashboard's "התפלגות דירוגים" cards. Each tier is a
 * club-level config row: a label and a rating range. How many players fall in
 * the range is derived live from the roster — never stored here.
 */
export interface RatingTier {
  id: string;
  /** Display order, low rating → high. */
  order: number;
  label: string;
  min: number;
  max: number;
}

/** Seeded starting point; the club edits these and the edits persist. */
export const defaultRatingTiers: RatingTier[] = [
  { id: "tier-1", order: 0, label: "מתחילים", min: 0, max: 800 },
  { id: "tier-2", order: 1, label: "בינוניים", min: 800, max: 1200 },
  { id: "tier-3", order: 2, label: "מתקדמים", min: 1200, max: 1600 },
  { id: "tier-4", order: 3, label: "אליטה", min: 1600, max: 3000 },
];
