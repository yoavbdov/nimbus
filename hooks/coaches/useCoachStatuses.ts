import { useCallback, useMemo, useState } from "react";
import {
  isCoachActive,
  type Coach,
  type CoachAssociations,
  type CoachRecord,
} from "@/lib/coaches-data";

/**
 * Resolves each coach's status from the rule:
 *   - active (responsible for ≥1 club or competition) → "פעיל"
 *   - otherwise → "לא פעיל", or "מחליף" once toggled by the user.
 * Active coaches cannot be toggled.
 *
 * `records` is the live roster read from Firestore; the "מחליף" override is
 * transient UI state and is never persisted.
 */
export function useCoachStatuses(records: (CoachRecord & CoachAssociations)[]) {
  const [substitutes, setSubstitutes] = useState<Set<string>>(new Set());

  const coaches = useMemo<Coach[]>(
    () =>
      records.map((record) => ({
        ...record,
        status: isCoachActive(record)
          ? "פעיל"
          : substitutes.has(record.id)
            ? "מחליף"
            : "לא פעיל",
      })),
    [records, substitutes],
  );

  const toggleStatus = useCallback(
    (id: string) => {
      const record = records.find((c) => c.id === id);
      if (!record || isCoachActive(record)) return;
      setSubstitutes((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [records],
  );

  return { coaches, toggleStatus };
}
