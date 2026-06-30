import { useState, type MouseEvent } from "react";
import { useCourseActionsMenu } from "@/hooks/useCourseActionsMenu";

export interface RegistrationClass {
  name: string;
  enrolled: number;
  capacity: number;
}

const classes: RegistrationClass[] = [
  { name: "שחמט מתחילים", enrolled: 4, capacity: 15 },
  { name: "שחמט מתקדמים", enrolled: 3, capacity: 20 },
  { name: "אימון קבוצתי", enrolled: 3, capacity: 20 },
  { name: "שחמט מחשב", enrolled: 16, capacity: 20 },
  { name: "מועדון בוגרים", enrolled: 30, capacity: 30 },
];

export function useRegistrationStatus() {
  const menu = useCourseActionsMenu();
  const [activeName, setActiveName] = useState<string | null>(null);

  function handleRowClick(name: string, e: MouseEvent) {
    setActiveName(name);
    menu.openAt(e);
  }

  function handleMenuOpenChange(next: boolean) {
    menu.setOpen(next);
    if (!next) setActiveName(null);
  }

  return {
    classes,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction: menu.onSelect,
    activeName,
    handleRowClick,
    handleMenuOpenChange,
  };
}
