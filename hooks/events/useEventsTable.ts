import { useState, type MouseEvent } from "react";
import { useEventsSort } from "@/hooks/events/useEventsSort";
import { useTournamentActionsMenu } from "@/hooks/useTournamentActionsMenu";
import { useAddEvent } from "@/hooks/events/useAddEvent";
import { useArchiveConfirm } from "@/hooks/useArchiveConfirm";
import { eventFormValuesFor } from "@/lib/event-details";
import type { RowAction } from "@/components/shared/RowActionsMenu";
import type { ClubEvent } from "@/lib/events-data";

export function useEventsTable(events: ClubEvent[]) {
  const sort = useEventsSort(events);
  const menu = useTournamentActionsMenu();
  const eventEdit = useAddEvent();
  const archive = useArchiveConfirm();
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
    } else if (action.id === "archive") {
      archive.openFor(1);
    }
    menu.onSelect(action);
  }

  function handleSelectAction(action: RowAction, selectedIds: string[]) {
    if (action.id === "archive") archive.openFor(selectedIds.length);
    menu.onSelect(action);
  }

  return {
    ...sort,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction: handleSelectAction,
    onRowAction: handleRowAction,
    archive,
    eventEdit,
    activeId,
    handleRowClick,
    handleMenuOpenChange,
  };
}
