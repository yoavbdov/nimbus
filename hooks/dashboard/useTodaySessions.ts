import { useState, type MouseEvent } from "react";
import { useCourseActionsMenu } from "@/hooks/useCourseActionsMenu";

export interface TodaySession {
  time: string;
  type: string;
  name: string;
  location: string;
  coach: string;
  enrolled: number;
  capacity: number;
}

const sessions: TodaySession[] = [
  {
    time: "16:00–18:00",
    type: "חוג",
    name: "אימון קבוצתי",
    location: "אולם תחרויות",
    coach: "אמיר ביטון",
    enrolled: 3,
    capacity: 20,
  },
];

export const todayLabel = "יום חמישי, 21 במאי";

export function useTodaySessions() {
  const menu = useCourseActionsMenu();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function handleRowClick(index: number, e: MouseEvent) {
    setActiveIndex(index);
    menu.openAt(e);
  }

  function handleMenuOpenChange(next: boolean) {
    menu.setOpen(next);
    if (!next) setActiveIndex(null);
  }

  return {
    sessions,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction: menu.onSelect,
    activeIndex,
    handleRowClick,
    handleMenuOpenChange,
  };
}
