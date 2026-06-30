import { Archive, CalendarCheck, CalendarHeart, DoorOpen, Package, Trash2 } from "lucide-react";
import type { RowAction } from "@/components/shared/RowActionsMenu";

export const eventActions: RowAction[] = [
  { id: "details", label: "פרטי אירוע", icon: CalendarHeart, variant: "default" },
  { id: "archive", label: "העברה לארכיון", icon: Archive, variant: "default" },
  { id: "delete", label: "מחיקת אירוע", icon: Trash2, variant: "destructive" },
];

export const roomActions: RowAction[] = [
  { id: "details", label: "פרטי חדר", icon: DoorOpen, variant: "default" },
  { id: "availability", label: "בדוק זמינות", icon: CalendarCheck, variant: "default" },
  { id: "delete", label: "מחיקת חדר", icon: Trash2, variant: "destructive" },
];

export const equipmentActions: RowAction[] = [
  { id: "details", label: "פרטי ציוד", icon: Package, variant: "default" },
  { id: "availability", label: "בדוק זמינות", icon: CalendarCheck, variant: "default" },
  { id: "delete", label: "מחיקת ציוד", icon: Trash2, variant: "destructive" },
];
