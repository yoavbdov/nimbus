import { useState, type MouseEvent } from "react";
import { useCoachesSort } from "@/hooks/coaches/useCoachesSort";
import { useCoachActionsMenu } from "@/hooks/useCoachActionsMenu";
import type { CoachAction } from "@/lib/coach-actions";
import type { Coach } from "@/lib/coaches-data";

interface UseCoachesTableOptions {
  /** Called when a menu action is chosen, with the row's coach id. */
  onAction?: (actionId: string, coachId: string | null) => void;
}

export function useCoachesTable(
  coaches: Coach[],
  { onAction }: UseCoachesTableOptions = {},
) {
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

  function onSelectAction(action: CoachAction) {
    const coachId = activeId;
    menu.close();
    setActiveId(null);
    onAction?.(action.id, coachId);
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
