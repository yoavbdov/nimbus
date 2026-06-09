import { useCallback, useMemo, useState } from "react";
import {
  coachRecords,
  isCoachActive,
  type Coach,
} from "@/lib/coaches-data";

/**
 * Resolves each coach's status from the rule:
 *   - active (responsible for ≥1 club or competition) → "פעיל"
 *   - otherwise → "לא פעיל", or "מחליף" once toggled by the user.
 * Active coaches cannot be toggled.
 */
export function useCoachStatuses() {
  const [substitutes, setSubstitutes] = useState<Set<string>>(new Set());

  const coaches = useMemo<Coach[]>(
    () =>
      coachRecords.map((record) => ({
        ...record,
        status: isCoachActive(record)
          ? "פעיל"
          : substitutes.has(record.id)
            ? "מחליף"
            : "לא פעיל",
      })),
    [substitutes],
  );

  const toggleStatus = useCallback((id: string) => {
    const record = coachRecords.find((c) => c.id === id);
    if (!record || isCoachActive(record)) return;
    setSubstitutes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return { coaches, toggleStatus };
}
