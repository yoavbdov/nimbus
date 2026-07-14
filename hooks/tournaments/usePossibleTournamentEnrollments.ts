import { useCallback, useMemo, useState } from "react";
import {
  possibleTournamentEnrollments,
  type EnrollmentCandidate,
} from "@/lib/possible-enrollments";
import { useCollection } from "@/lib/firebase/useCollection";
import type { Tournament } from "@/lib/tournaments-data";
import type { Player } from "@/lib/players-data";
import type { RelationDoc } from "@/lib/relations-data";

/**
 * Drives the "possible enrollments" dialog: which tournament it shows and its
 * candidates. Both the roster and the "already registered" set are read LIVE
 * from Firestore (players + the `player_tournament` relations), so the list
 * reflects the real data, never a static mock.
 */
export function usePossibleTournamentEnrollments() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [open, setOpen] = useState(false);
  const { data: players } = useCollection<Player>("players");
  const { data: relations } = useCollection<RelationDoc>("relations");

  const openFor = useCallback((next: Tournament) => {
    setTournament(next);
    setOpen(true);
  }, []);

  const candidates: EnrollmentCandidate[] = useMemo(() => {
    if (!tournament) return [];
    const enrolledIds = new Set(
      relations
        .filter(
          (r) =>
            r.kind === "player_tournament" && r.targetId === tournament.id,
        )
        .map((r) => r.subjectId),
    );
    return possibleTournamentEnrollments(tournament, players, enrolledIds);
  }, [tournament, players, relations]);

  return { open, onOpenChange: setOpen, openFor, tournament, candidates };
}
