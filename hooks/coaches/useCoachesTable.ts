import { useState, type MouseEvent } from "react";
import { useCoachesSort } from "@/hooks/coaches/useCoachesSort";
import { useCoachActionsMenu } from "@/hooks/useCoachActionsMenu";
import type { Coach } from "@/lib/coaches-data";

export function useCoachesTable(coaches: Coach[]) {
  const sort = useCoachesSort(coaches);
  const menu = useCoachActionsMenu();
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
