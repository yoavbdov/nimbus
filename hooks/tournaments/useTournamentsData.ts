import { useMemo } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import type { Tournament } from "@/lib/tournaments-data";
import type { RelationDoc } from "@/lib/relations-data";

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

  const tournaments = useMemo<Tournament[]>(() => {
    const enrolled = new Map<string, number>();
    for (const rel of relations) {
      if (rel.kind === "player_tournament") {
        enrolled.set(rel.targetId, (enrolled.get(rel.targetId) ?? 0) + 1);
      }
    }
    return records
      // Archived tournaments live only in the Tools archive, not the main list.
      .filter((tournament) => tournament.status !== "ארכיון")
      .map((tournament) => ({
        ...tournament,
        // Always the live `player_tournament` count (never the authored number),
        // so the table matches the שחקנים tab exactly — like enrolled in courses.
        participants: enrolled.get(tournament.id) ?? 0,
      }));
  }, [records, relations]);

  return { tournaments, loading: loading || relationsLoading };
}
