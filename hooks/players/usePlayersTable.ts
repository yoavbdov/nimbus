import { useState, type MouseEvent } from "react";
import { usePlayersSort } from "@/hooks/players/usePlayersSort";
import { usePlayerActionsMenu } from "@/hooks/usePlayerActionsMenu";
import type { Player } from "@/lib/players-data";

export function usePlayersTable(players: Player[]) {
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
