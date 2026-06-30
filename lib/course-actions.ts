import { BookOpen, User, Wand2, Archive, Trash2, type LucideIcon } from "lucide-react";

export interface CourseAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant: "default" | "destructive";
}

export const courseActions: CourseAction[] = [
  { id: "details", label: "פרטי חוג", icon: BookOpen, variant: "default" },
  { id: "coach", label: "פרטי מדריך", icon: User, variant: "default" },
  { id: "enrollments", label: "רישומים אפשריים", icon: Wand2, variant: "default" },
  { id: "archive", label: "העברה לארכיון", icon: Archive, variant: "default" },
  { id: "delete", label: "מחיקת חוג", icon: Trash2, variant: "destructive" },
];
