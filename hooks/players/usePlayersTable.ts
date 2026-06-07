import { useState, type MouseEvent } from "react";
import { usePlayersSort } from "@/hooks/players/usePlayersSort";
import { usePlayerActionsMenu } from "@/hooks/usePlayerActionsMenu";
import type { PlayerAction } from "@/lib/player-actions";
import type { Player } from "@/lib/players-data";

interface UsePlayersTableOptions {
  /** Called when a menu action is chosen, with the row's player id. */
  onAction?: (actionId: string, playerId: string | null) => void;
}

export function usePlayersTable(
  players: Player[],
  { onAction }: UsePlayersTableOptions = {},
) {
  const sort = usePlayersSort(players);
  const menu = usePlayerActionsMenu();
  const [activeId, setActiveId] = useState<string | null>(null);

  function handleRowClick(id: string, e: MouseEvent) {
    setActiveId(id);
    menu.openAt(e);
  }

  function handleMenuOpenChange(next: boolean) {
    menu.setOpen(next);
    if (!next) setActiveId(null);
  }

  function onSelectAction(action: PlayerAction) {
    const playerId = activeId;
    menu.close();
    setActiveId(null);
    onAction?.(action.id, playerId);
  }

  return {
    ...sort,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction,
    activeId,
    handleRowClick,
    handleMenuOpenChange,
  };
}
