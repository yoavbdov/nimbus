import { Swords, Users, Trash2, type LucideIcon } from "lucide-react";

export interface LeagueAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant: "default" | "destructive";
}

export const leagueActions: LeagueAction[] = [
  { id: "details", label: "פרטי קבוצה", icon: Swords, variant: "default" },
  { id: "players", label: "רשימת שחקנים", icon: Users, variant: "default" },
  { id: "delete", label: "מחיקת קבוצה", icon: Trash2, variant: "destructive" },
];
