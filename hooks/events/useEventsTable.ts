import { useState, type MouseEvent } from "react";
import { useEventsSort } from "@/hooks/events/useEventsSort";
import { useTournamentActionsMenu } from "@/hooks/useTournamentActionsMenu";
import type { ClubEvent } from "@/lib/events-data";

export function useEventsTable(events: ClubEvent[]) {
  const sort = useEventsSort(events);
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
