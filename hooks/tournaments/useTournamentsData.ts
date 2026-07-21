import { useMemo } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import { daysForParent, type SessionDoc } from "@/lib/sessions-data";
import {
  activityTiming,
  formatActivityDate,
  type TimingState,
} from "@/lib/activity-timing";
import type { Tournament, TournamentStatus } from "@/lib/tournaments-data";
import type { RelationDoc } from "@/lib/relations-data";

/** Timing state → the feminine status label a תחרות shows. */
const TOURNAMENT_STATUS: Record<TimingState, TournamentStatus> = {
  none: "ללא פעילות",
  planned: "מתוכננת",
  active: "פעילה",
  ended: "הסתיימה",
};

/**
 * Reads the tournaments live from Firestore and projects the participant count
 * that is NOT stored on the tournament doc: the number of `player_tournament`
 * links pointing at it. Docs are keyed by name, so a relation's `targetId`
 * already IS the display name.
 *
 * `participants` is derived from the real enrolled count, never authored.
 */
export function useTournamentsData() {
  const { data: records, loading } = useCollection<Tournament>("tournaments");
  const { data: relations, loading: relationsLoading } =
    useCollection<RelationDoc>("relations");
  // The activity days shown in the table are computed live from each
  // tournament's `sessions` (the single source of truth), so the table never
  // drifts from the actual rounds/schedule; the authored `days` scalar is only
  // a fallback for tournaments with no session documents yet.
  const { data: sessions, loading: sessionsLoading } =
    useCollection<SessionDoc>("sessions");

  const tournaments = useMemo<Tournament[]>(() => {
    const now = new Date();
    const enrolled = new Map<string, number>();
    for (const rel of relations) {
      if (rel.kind === "player_tournament") {
        enrolled.set(rel.targetId, (enrolled.get(rel.targetId) ?? 0) + 1);
      }
    }
    return records
      // Archived tournaments live only in the Tools archive, not the main list.
      .filter((tournament) => tournament.status !== "ארכיון")
      .map((tournament) => {
        const own = sessions.filter((s) => s.parentId === tournament.id);
        const liveDays = daysForParent(sessions, tournament.id);
        // Status + next meeting are derived from the sessions (the source of
        // truth), never the authored fields.
        const timing = activityTiming(own, now);
        return {
          ...tournament,
          days: liveDays.length ? liveDays : tournament.days,
          status: TOURNAMENT_STATUS[timing.state],
          nextDate: formatActivityDate(timing.nextDate),
          // Always the live `player_tournament` count (never the authored
          // number), so the table matches the שחקנים tab exactly — like
          // enrolled in courses.
          participants: enrolled.get(tournament.id) ?? 0,
        };
      });
  }, [records, relations, sessions]);

  return {
    tournaments,
    loading: loading || relationsLoading || sessionsLoading,
  };
}
