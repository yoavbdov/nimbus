import { useMemo } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import { daysForParent, type SessionDoc } from "@/lib/sessions-data";
import {
  activityTiming,
  formatActivityDate,
  type TimingState,
} from "@/lib/activity-timing";
import type { ClubEvent, EventStatus } from "@/lib/events-data";

/** Timing state → the status label an אירוע shows. */
const EVENT_STATUS: Record<TimingState, EventStatus> = {
  none: "ללא פעילות",
  planned: "מתוכנן",
  active: "פעיל",
  ended: "הסתיים",
};

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

  const events = useMemo<ClubEvent[]>(() => {
    const now = new Date();
    return records
      .filter((event) => event.status !== "ארכיון")
      .map((event) => {
        const own = sessions.filter((s) => s.parentId === event.id);
        const liveDays = daysForParent(sessions, event.id);
        // Status + next meeting are derived from the sessions, not authored.
        const timing = activityTiming(own, now);
        return {
          ...event,
          days: liveDays.length ? liveDays : event.days,
          status: EVENT_STATUS[timing.state],
          nextDate: formatActivityDate(timing.nextDate),
        };
      });
  }, [records, sessions]);

  return { events, loading: loading || sessionsLoading };
}
