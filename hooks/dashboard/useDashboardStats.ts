import { useCollection } from "@/lib/firebase/useCollection";
import type { Player } from "@/lib/players-data";
import { todayHebrewDay, type Course } from "@/lib/courses-data";
import type { Tournament } from "@/lib/tournaments-data";

export interface DashboardStatValues {
  activePlayers: number;
  activeCourses: number;
  coursesToday: number;
  tournamentsToday: number;
  loading: boolean;
}

/**
 * Live dashboard card counts, read straight from Firestore:
 *   - active players   → status "פעיל"
 *   - active courses   → status "פעיל"
 *   - courses today    → active courses scheduled on today's weekday
 *   - tournaments today → "פעילה" tournaments scheduled on today's weekday
 */
export function useDashboardStats(): DashboardStatValues {
  const players = useCollection<Player>("players");
  const courses = useCollection<Course>("courses");
  const tournaments = useCollection<Tournament>("tournaments");

  const today = todayHebrewDay();

  const activeCoursesList = courses.data.filter((c) => c.status === "פעיל");

  return {
    activePlayers: players.data.filter((p) => p.status === "פעיל").length,
    activeCourses: activeCoursesList.length,
    coursesToday: activeCoursesList.filter((c) => c.days?.includes(today))
      .length,
    tournamentsToday: tournaments.data.filter(
      (t) => t.status === "פעילה" && t.days?.includes(today),
    ).length,
    loading: players.loading || courses.loading || tournaments.loading,
  };
}
