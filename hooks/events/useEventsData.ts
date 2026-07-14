import { useMemo } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import { daysForParent, type SessionDoc } from "@/lib/sessions-data";
import type { ClubEvent } from "@/lib/events-data";

/**
 * Reads the events live from Firestore. Archived events live only in the Tools
 * archive, not the main list. The activity days shown in the table are computed
 * live from the event's `sessions` (the single source of truth), so the table
 * never drifts from what's actually scheduled; the authored `days` scalar is
 * only a fallback for events that have no session documents yet.
 */
export function useEventsData() {
  const { data: records, loading } = useCollection<ClubEvent>("events");
  const { data: sessions, loading: sessionsLoading } =
    useCollection<SessionDoc>("sessions");

  const events = useMemo<ClubEvent[]>(
    () =>
      records
        .filter((event) => event.status !== "ארכיון")
        .map((event) => {
          const liveDays = daysForParent(sessions, event.id);
          return liveDays.length ? { ...event, days: liveDays } : event;
        }),
    [records, sessions],
  );

  return { events, loading: loading || sessionsLoading };
}
