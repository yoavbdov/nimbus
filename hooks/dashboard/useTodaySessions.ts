import { useMemo, useState, type MouseEvent } from "react";
import { toISODate } from "@/lib/calendar";
import { todayHebrewDay } from "@/lib/courses-data";
import { useScheduleEvents } from "@/hooks/schedule/useScheduleEvents";
import { useScheduleEventMenu } from "@/hooks/schedule/useScheduleEventMenu";
import { useScheduleEventActions } from "@/hooks/schedule/useScheduleEventActions";
import type { EventCategory } from "@/lib/schedule-data";

export interface TodaySession {
  id: string;
  time: string;
  type: EventCategory;
  name: string;
  location: string;
  participants: number;
}

export const todayLabel = `יום ${todayHebrewDay()}`;

/**
 * The courses that actually meet TODAY, derived from the real session
 * occurrences (not the authored days/status). Clicking a row opens the same
 * course menu and edit/archive flows the schedule uses, so interactions stay
 * identical across the app.
 */
export function useTodaySessions() {
  // Fixed once per mount so the derived list is stable.
  const [today] = useState(() => new Date());
  const events = useScheduleEvents(today);
  const menu = useScheduleEventMenu();
  const actions = useScheduleEventActions();

  const todayIso = toISODate(today);

  const todayEvents = useMemo(
    () =>
      events
        .filter((e) => e.date === todayIso && e.category === "חוג")
        .sort((a, b) => a.start.localeCompare(b.start)),
    [events, todayIso],
  );

  const sessions = useMemo<TodaySession[]>(
    () =>
      todayEvents.map((e) => ({
        id: e.id,
        time: `${e.start}–${e.end}`,
        type: e.category,
        name: e.title,
        location: e.location,
        participants: e.players.length,
      })),
    [todayEvents],
  );

  function handleRowClick(index: number, e: MouseEvent) {
    menu.openAt(todayEvents[index], e);
  }

  function handleSelect(action: { id: string }) {
    if (menu.activeEvent) actions.dispatch(menu.activeEvent, action.id);
    menu.onSelect();
  }

  return { sessions, menu, actions, handleRowClick, handleSelect };
}
