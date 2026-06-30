import { useState, type MouseEvent } from "react";
import { useLeaguesSort } from "@/hooks/leagues/useLeaguesSort";
import { useLeagueActionsMenu } from "@/hooks/leagues/useLeagueActionsMenu";
import type { LeagueAction } from "@/lib/league-actions";
import type { LeagueTeam } from "@/lib/leagues-data";

export function useLeaguesTable(
  teams: LeagueTeam[],
  onAction?: (actionId: string, teamId: string) => void,
) {
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

  // Close the menu, then dispatch the chosen action for the active row.
  function handleSelectAction(action: LeagueAction) {
    menu.onSelect(action);
    if (activeId) onAction?.(action.id, activeId);
  }

  return {
    ...sort,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction: handleSelectAction,
    activeId,
    handleRowClick,
    handleMenuOpenChange,
  };
}
