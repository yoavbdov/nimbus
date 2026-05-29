import {
  User,
  BookOpen,
  CalendarCheck,
  Trash2,
  type LucideIcon,
} from "lucide-react";

export interface CoachAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant: "default" | "destructive";
}

export const coachActions: CoachAction[] = [
  { id: "details", label: "פרטי מדריך", icon: User, variant: "default" },
  { id: "clubs", label: "שיוך לחוגים", icon: BookOpen, variant: "default" },
  { id: "availability", label: "בדיקת זמינות", icon: CalendarCheck, variant: "default" },
  { id: "delete", label: "מחק מדריך", icon: Trash2, variant: "destructive" },
];
