import { useState, type MouseEvent } from "react";
import { useTournamentsSort } from "@/hooks/tournaments/useTournamentsSort";
import { useTournamentActionsMenu } from "@/hooks/useTournamentActionsMenu";
import type { Tournament } from "@/lib/tournaments-data";

export function useTournamentsTable(tournaments: Tournament[]) {
  const sort = useTournamentsSort(tournaments);
  const menu = useTournamentActionsMenu();
  const [activeId, setActiveId] = useState<string | null>(null);

  function handleRowClick(id: string, e: MouseEvent) {
    setActiveId(id);
    menu.openAt(e);
  }

  function handleMenuOpenChange(next: boolean) {
    menu.setOpen(next);
    if (!next) setActiveId(null);
  }

  return {
    ...sort,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction: menu.onSelect,
    activeId,
    handleRowClick,
    handleMenuOpenChange,
  };
}
