import { useState, type MouseEvent } from "react";
import { useEventsSort } from "@/hooks/events/useEventsSort";
import { useTournamentActionsMenu } from "@/hooks/useTournamentActionsMenu";
import { useAddEvent } from "@/hooks/events/useAddEvent";
import { useDeleteEvent } from "@/hooks/events/useDeleteEvent";
import { archiveEvent } from "@/lib/firebase/data/events";
import { useArchiveConfirm } from "@/hooks/useArchiveConfirm";
import { useCollection } from "@/lib/firebase/useCollection";
import { eventFormValuesFromLive } from "@/lib/event-details";
import type { RowAction } from "@/components/shared/RowActionsMenu";
import type { ClubEvent } from "@/lib/events-data";
import type { SessionDoc } from "@/lib/sessions-data";
import type { RelationDoc } from "@/lib/relations-data";

export function useEventsTable(events: ClubEvent[]) {
  const sort = useEventsSort(events);
  const menu = useTournamentActionsMenu();
  const eventEdit = useAddEvent();
  const deleteEvent = useDeleteEvent();
  const archive = useArchiveConfirm();
  // Read live so opening "פרטי אירוע" prefills the slot/players/equipment from
  // the real sessions + relations, not the legacy mock.
  const { data: sessions } = useCollection<SessionDoc>("sessions");
  const { data: relations } = useCollection<RelationDoc>("relations");
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
      eventEdit.openForEdit(eventFormValuesFromLive(event, sessions, relations));
    } else if (action.id === "archive") {
      if (event)
        archive.openFor(1, {
          names: [event.name],
          onConfirm: () => void archiveEvent(event.id),
        });
    } else if (action.id === "delete") {
      if (event) deleteEvent.openFor([{ id: event.id, name: event.name }]);
    }
    menu.onSelect(action);
    setActiveId(null);
  }

  function handleSelectAction(action: RowAction, selectedIds: string[]) {
    if (action.id === "archive")
      archive.openFor(selectedIds.length, {
        names: selectedIds.map(
          (id) => events.find((e) => e.id === id)?.name ?? id,
        ),
        onConfirm: () => {
          for (const id of selectedIds) void archiveEvent(id);
        },
      });
    else if (action.id === "delete") {
      deleteEvent.openFor(
        selectedIds.map((id) => ({
          id,
          name: events.find((e) => e.id === id)?.name ?? id,
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
    deleteEvent,
    eventEdit,
    activeId,
    handleRowClick,
    handleMenuOpenChange,
  };
}
