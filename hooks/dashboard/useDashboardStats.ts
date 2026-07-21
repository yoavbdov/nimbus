import { useMemo } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import { toISODate } from "@/lib/calendar";
import { useScheduleEvents } from "@/hooks/schedule/useScheduleEvents";
import type { Player } from "@/lib/players-data";
import type { Course } from "@/lib/courses-data";

export interface DashboardStatValues {
  activePlayers: number;
  activeCourses: number;
  coursesToday: number;
  tournamentsToday: number;
  loading: boolean;
}

/**
 * Live dashboard card counts.
 *   - active players → status "פעיל"
 *   - active courses → status "פעיל"
 *   - courses today / tournaments today → the real session occurrences on
 *     today's actual DATE (not the weekday), each filtered to its own activity
 *     type, so each count matches exactly what its panel lists.
 */
export function useDashboardStats(): DashboardStatValues {
  const players = useCollection<Player>("players");
  const courses = useCollection<Course>("courses");

  const today = useMemo(() => new Date(), []);
  const events = useScheduleEvents(today);
  const todayIso = toISODate(today);
  const todayEvents = events.filter((e) => e.date === todayIso);

  return {
    activePlayers: players.data.filter((p) => p.status === "פעיל").length,
    activeCourses: courses.data.filter((c) => c.status === "פעיל").length,
    coursesToday: todayEvents.filter((e) => e.category === "חוג").length,
    tournamentsToday: todayEvents.filter((e) => e.category === "תחרות").length,
    loading: players.loading || courses.loading,
  };
}
