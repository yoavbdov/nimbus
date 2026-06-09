import { useState, type MouseEvent } from "react";
import { useActivitiesSort } from "@/hooks/activities/useActivitiesSort";
import { useActivityActionsMenu } from "@/hooks/useActivityActionsMenu";
import { usePossibleEnrollments } from "@/hooks/activities/usePossibleEnrollments";
import { useAddCoach } from "@/hooks/coaches/useAddCoach";
import { coaches } from "@/lib/coaches-data";
import { coachFormValuesFor } from "@/lib/coach-details";
import type { ActivityAction } from "@/lib/activity-actions";
import type { Activity } from "@/lib/activities-data";

export function useActivitiesTable(activities: Activity[]) {
  const sort = useActivitiesSort(activities);
  const menu = useActivityActionsMenu();
  const enrollments = usePossibleEnrollments();
  const coachEdit = useAddCoach();
  const [activeId, setActiveId] = useState<string | null>(null);

  function handleRowClick(id: string, e: MouseEvent) {
    setActiveId(id);
    menu.openAt(e);
  }

  function handleMenuOpenChange(next: boolean) {
    menu.setOpen(next);
    if (!next) setActiveId(null);
  }

  function handleRowAction(action: ActivityAction) {
    const activity = activities.find((a) => a.id === activeId);
    if (action.id === "enrollments") {
      if (activity) enrollments.openFor(activity);
    } else if (action.id === "coach") {
      const coach = activity && coaches.find((c) => c.name === activity.coach);
      if (coach) coachEdit.openForEdit(coachFormValuesFor(coach));
    }
    menu.onSelect(action);
  }

  return {
    ...sort,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction: menu.onSelect,
    onRowAction: handleRowAction,
    enrollments,
    coachEdit,
    activeId,
    handleRowClick,
    handleMenuOpenChange,
  };
}
