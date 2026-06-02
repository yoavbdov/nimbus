import { useState, type MouseEvent } from "react";
import { useLeaguesSort } from "@/hooks/leagues/useLeaguesSort";
import { useLeagueActionsMenu } from "@/hooks/leagues/useLeagueActionsMenu";
import type { LeagueTeam } from "@/lib/leagues-data";

export function useLeaguesTable(teams: LeagueTeam[]) {
  const sort = useLeaguesSort(teams);
  const menu = useLeagueActionsMenu();
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
