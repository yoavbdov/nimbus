import {
  User,
  BookOpen,
  Trophy,
  Swords,
  CalendarCheck,
  Trash2,
  type LucideIcon,
} from "lucide-react";

export interface PlayerAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant: "default" | "destructive";
}

export const playerActions: PlayerAction[] = [
  { id: "details", label: "פרטי שחקן", icon: User, variant: "default" },
  { id: "clubs", label: "הרשמה לחוגים", icon: BookOpen, variant: "default" },
  { id: "tournaments", label: "הרשמה לתחרויות", icon: Trophy, variant: "default" },
  { id: "league", label: "הרשמה לליגה", icon: Swords, variant: "default" },
  { id: "availability", label: "בדיקת זמינות", icon: CalendarCheck, variant: "default" },
  { id: "delete", label: "מחק שחקן", icon: Trash2, variant: "destructive" },
];
