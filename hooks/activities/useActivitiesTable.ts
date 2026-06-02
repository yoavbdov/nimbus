import { useState, type MouseEvent } from "react";
import { useActivitiesSort } from "@/hooks/activities/useActivitiesSort";
import { useActivityActionsMenu } from "@/hooks/useActivityActionsMenu";
import type { Activity } from "@/lib/activities-data";

export function useActivitiesTable(activities: Activity[]) {
  const sort = useActivitiesSort(activities);
  const menu = useActivityActionsMenu();
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
