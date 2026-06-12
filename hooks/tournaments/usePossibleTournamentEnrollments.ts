import { useCallback, useMemo, useState } from "react";
import {
  possibleTournamentEnrollments,
  type EnrollmentCandidate,
} from "@/lib/possible-enrollments";
import type { Tournament } from "@/lib/tournaments-data";

/** Drives the "possible enrollments" dialog: which tournament it shows and its candidates. */
export function usePossibleTournamentEnrollments() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [open, setOpen] = useState(false);

  const openFor = useCallback((next: Tournament) => {
    setTournament(next);
    setOpen(true);
  }, []);

  const candidates: EnrollmentCandidate[] = useMemo(
    () => (tournament ? possibleTournamentEnrollments(tournament) : []),
    [tournament],
  );

  return { open, onOpenChange: setOpen, openFor, tournament, candidates };
}
