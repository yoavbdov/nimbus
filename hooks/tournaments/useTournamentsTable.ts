import { useState, type MouseEvent } from "react";
import { useTournamentsSort } from "@/hooks/tournaments/useTournamentsSort";
import { useTournamentActionsMenu } from "@/hooks/useTournamentActionsMenu";
import { useAddTournament } from "@/hooks/tournaments/useAddTournament";
import { useDeleteTournament } from "@/hooks/tournaments/useDeleteTournament";
import { usePossibleTournamentEnrollments } from "@/hooks/tournaments/usePossibleTournamentEnrollments";
import { useAddCoach } from "@/hooks/coaches/useAddCoach";
import { archiveTournament } from "@/lib/firebase/data/tournaments";
import { useArchiveConfirm } from "@/hooks/useArchiveConfirm";
import { useCollection } from "@/lib/firebase/useCollection";
import { coachFormValuesFor } from "@/lib/coach-details";
import { tournamentFormValuesFromLive } from "@/lib/tournament-details";
import type { TournamentAction } from "@/lib/tournament-actions";
import type { Tournament } from "@/lib/tournaments-data";
import type { CoachRecord } from "@/lib/coaches-data";
import type { SessionDoc } from "@/lib/sessions-data";
import type { RelationDoc } from "@/lib/relations-data";

export function useTournamentsTable(tournaments: Tournament[]) {
  const sort = useTournamentsSort(tournaments);
  const menu = useTournamentActionsMenu();
  const tournamentEdit = useAddTournament();
  const deleteTournament = useDeleteTournament();
  const enrollments = usePossibleTournamentEnrollments();
  const coachEdit = useAddCoach();
  const archive = useArchiveConfirm();
  // Read live so opening "פרטי תחרות" prefills rounds/players/equipment from the
  // real sessions + relations, not the legacy mock.
  const { data: sessions } = useCollection<SessionDoc>("sessions");
  const { data: relations } = useCollection<RelationDoc>("relations");
  // Read coaches live so opening a judge's "פרטי מדריך" prefills the note (and
  // every other field) from Firestore, and edits round-trip to the real doc —
  // the static mock has neither the saved note nor a persisted target.
  const { data: coaches } = useCollection<CoachRecord>("coaches");
  const [activeId, setActiveId] = useState<string | null>(null);

  function handleRowClick(id: string, e: MouseEvent) {
    setActiveId(id);
    menu.openAt(e);
  }

  function handleMenuOpenChange(next: boolean) {
    menu.setOpen(next);
    if (!next) setActiveId(null);
  }

  function handleRowAction(action: TournamentAction) {
    const tournament = tournaments.find((t) => t.id === activeId);
    if (action.id === "details" && tournament) {
      tournamentEdit.openForEdit(
        tournamentFormValuesFromLive(tournament, sessions, relations),
      );
    } else if (action.id === "enrollments" && tournament) {
      enrollments.openFor(tournament);
    } else if (action.id === "judge") {
      const coach = tournament && coaches.find((c) => c.name === tournament.judge);
      if (coach) coachEdit.openForEdit(coachFormValuesFor(coach));
    } else if (action.id === "archive") {
      if (tournament)
        archive.openFor(1, {
          names: [tournament.name],
          onConfirm: () => void archiveTournament(tournament.id),
        });
    } else if (action.id === "delete") {
      if (tournament)
        deleteTournament.openFor([{ id: tournament.id, name: tournament.name }]);
    }
    menu.onSelect(action);
    setActiveId(null);
  }

  function handleSelectAction(action: TournamentAction, selectedIds: string[]) {
    if (action.id === "archive")
      archive.openFor(selectedIds.length, {
        names: selectedIds.map(
          (id) => tournaments.find((t) => t.id === id)?.name ?? id,
        ),
        onConfirm: () => {
          for (const id of selectedIds) void archiveTournament(id);
        },
      });
    else if (action.id === "delete") {
      deleteTournament.openFor(
        selectedIds.map((id) => ({
          id,
          name: tournaments.find((t) => t.id === id)?.name ?? id,
        })),
      );
    }
    menu.onSelect(action);
  }

  return {
    ...sort,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction: handleSelectAction,
    onRowAction: handleRowAction,
    archive,
    deleteTournament,
    tournamentEdit,
    enrollments,
    coachEdit,
    activeId,
    handleRowClick,
    handleMenuOpenChange,
  };
}
