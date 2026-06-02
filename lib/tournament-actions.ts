import { Trophy, User, Trash2, type LucideIcon } from "lucide-react";

export interface TournamentAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant: "default" | "destructive";
}

export const tournamentActions: TournamentAction[] = [
  { id: "details", label: "פרטי תחרות", icon: Trophy, variant: "default" },
  { id: "judge", label: "פרטי שופט", icon: User, variant: "default" },
  { id: "delete", label: "מחיקת תחרות", icon: Trash2, variant: "destructive" },
];
