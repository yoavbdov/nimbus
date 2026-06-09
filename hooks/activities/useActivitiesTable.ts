import { useState, type MouseEvent } from "react";
import { useActivitiesSort } from "@/hooks/activities/useActivitiesSort";
import { useActivityActionsMenu } from "@/hooks/useActivityActionsMenu";
import { usePossibleEnrollments } from "@/hooks/activities/usePossibleEnrollments";
import { useAddCoach } from "@/hooks/coaches/useAddCoach";
import { useAddActivity } from "@/hooks/activities/useAddActivity";
import { coaches } from "@/lib/coaches-data";
import { coachFormValuesFor } from "@/lib/coach-details";
import { activityFormValuesFor } from "@/lib/activity-details";
import type { ActivityAction } from "@/lib/activity-actions";
import type { Activity } from "@/lib/activities-data";

export function useActivitiesTable(activities: Activity[]) {
  const sort = useActivitiesSort(activities);
  const menu = useActivityActionsMenu();
  const enrollments = usePossibleEnrollments();
  const coachEdit = useAddCoach();
  const activityEdit = useAddActivity();
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
    } else if (action.id === "details") {
      if (activity) activityEdit.openForEdit(activityFormValuesFor(activity));
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
    activityEdit,
    activeId,
    handleRowClick,
    handleMenuOpenChange,
  };
}
