import { useCallback, useMemo } from "react";
import {
  isCoachActive,
  type Coach,
  type CoachAssociations,
  type CoachRecord,
} from "@/lib/coaches-data";
import { updateCoach } from "@/lib/firebase/data/coaches";

/**
 * Resolves each coach's status from the rule:
 *   - active (responsible for ≥1 club or competition) → "פעיל"
 *   - otherwise → "לא פעיל", or "מחליף" when the coach is flagged as a stand-in.
 * Active coaches cannot be toggled.
 *
 * `records` is the live roster read from Firestore, and the "מחליף" flag is
 * persisted back to it, so the choice survives a reload.
 */
export function useCoachStatuses(records: (CoachRecord & CoachAssociations)[]) {
  const coaches = useMemo<Coach[]>(
    () =>
      records.map((record) => ({
        ...record,
        status: isCoachActive(record)
          ? "פעיל"
          : record.substitute
            ? "מחליף"
            : "לא פעיל",
      })),
    [records],
  );

  const toggleStatus = useCallback(
    (id: string) => {
      const record = records.find((c) => c.id === id);
      if (!record || isCoachActive(record)) return;
      // The snapshot listener re-renders with the new value once the write lands.
      void updateCoach(id, { substitute: !record.substitute });
    },
    [records],
  );

  return { coaches, toggleStatus };
}
