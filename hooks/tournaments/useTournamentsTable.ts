import { useState, type MouseEvent } from "react";
import { useTournamentsSort } from "@/hooks/tournaments/useTournamentsSort";
import { useTournamentActionsMenu } from "@/hooks/useTournamentActionsMenu";
import { useAddTournament } from "@/hooks/tournaments/useAddTournament";
import { tournamentFormValuesFor } from "@/lib/tournament-details";
import type { TournamentAction } from "@/lib/tournament-actions";
import type { Tournament } from "@/lib/tournaments-data";

export function useTournamentsTable(tournaments: Tournament[]) {
  const sort = useTournamentsSort(tournaments);
  const menu = useTournamentActionsMenu();
  const tournamentEdit = useAddTournament();
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
      tournamentEdit.openForEdit(tournamentFormValuesFor(tournament));
    }
    menu.onSelect(action);
  }

  return {
    ...sort,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction: menu.onSelect,
    onRowAction: handleRowAction,
    tournamentEdit,
    activeId,
    handleRowClick,
    handleMenuOpenChange,
  };
}
