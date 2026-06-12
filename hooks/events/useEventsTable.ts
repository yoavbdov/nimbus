import { useState, type MouseEvent } from "react";
import { useEventsSort } from "@/hooks/events/useEventsSort";
import { useTournamentActionsMenu } from "@/hooks/useTournamentActionsMenu";
import { useAddEvent } from "@/hooks/events/useAddEvent";
import { eventFormValuesFor } from "@/lib/event-details";
import type { RowAction } from "@/components/shared/RowActionsMenu";
import type { ClubEvent } from "@/lib/events-data";

export function useEventsTable(events: ClubEvent[]) {
  const sort = useEventsSort(events);
  const menu = useTournamentActionsMenu();
  const eventEdit = useAddEvent();
  const [activeId, setActiveId] = useState<string | null>(null);

  function handleRowClick(id: string, e: MouseEvent) {
    setActiveId(id);
    menu.openAt(e);
  }

  function handleMenuOpenChange(next: boolean) {
    menu.setOpen(next);
    if (!next) setActiveId(null);
  }

  function handleRowAction(action: RowAction) {
    const event = events.find((e) => e.id === activeId);
    if (action.id === "details" && event) {
      eventEdit.openForEdit(eventFormValuesFor(event));
    }
    menu.onSelect(action);
  }

  return {
    ...sort,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction: menu.onSelect,
    onRowAction: handleRowAction,
    eventEdit,
    activeId,
    handleRowClick,
    handleMenuOpenChange,
  };
}
