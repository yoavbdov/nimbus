"use client";

import { CalendarDays, Gauge } from "lucide-react";

export interface CriteriaSummaryProps {
  /** Age/rating bounds; a falsy (0 / null) side means no limit on that side. */
  ageMin?: number | null;
  ageMax?: number | null;
  noAgeLimit?: boolean;
  ratingMin?: number | null;
  ratingMax?: number | null;
  noRatingLimit?: boolean;
}

/** "1200–1600" / "מ-1200" / "עד 1600" / "ללא הגבלה" for one range. */
function rangeLabel(
  min: number | null | undefined,
  max: number | null | undefined,
  noLimit: boolean | undefined,
): string {
  const lo = min ? min : null;
  const hi = max ? max : null;
  if (noLimit || (lo == null && hi == null)) return "ללא הגבלה";
  if (lo != null && hi != null) return `${lo}–${hi}`;
  if (lo != null) return `מ-${lo}`;
  return `עד ${hi}`;
}

/** One labelled criterion pill: an icon, its title and the range value. */
function CriterionPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg neu-inset bg-foreground/5 px-2.5 py-1">
      <span className="text-primary/70">{icon}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-primary">{value}</span>
    </div>
  );
}

/**
 * A compact, balanced summary of the criteria an activity imposes: מד כושר above
 * גיל (rating first, then age). Shown at the top of the "possible enrollments"
 * dialog so it's clear which bounds the listed candidates satisfy.
 */
export function CriteriaSummary({
  ageMin,
  ageMax,
  noAgeLimit,
  ratingMin,
  ratingMax,
  noRatingLimit,
}: CriteriaSummaryProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <CriterionPill
        icon={<Gauge className="size-3.5" />}
        label="מד כושר"
        value={rangeLabel(ratingMin, ratingMax, noRatingLimit)}
      />
      <CriterionPill
        icon={<CalendarDays className="size-3.5" />}
        label="גיל"
        value={rangeLabel(ageMin, ageMax, noAgeLimit)}
      />
    </div>
  );
}
