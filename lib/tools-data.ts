import {
  Archive,
  ClipboardX,
  Gauge,
  MessageCircle,
  Users,
  type LucideIcon,
} from "lucide-react";

// ── Tools lobby ────────────────────────────────────────────────────
// Each tool is its own sub-page under /tools. The lobby just lists them.

export interface ToolCard {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

/** Short labels for the Sidebar nested menu. */
export const toolNavItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/tools/cleanup", label: "ארכיון פעילויות", icon: Archive },
  { href: "/tools/missing-attendance", label: "נוכחות חסרה", icon: ClipboardX },
  { href: "/tools/whatsapp", label: "שליחת וואטסאפ", icon: MessageCircle },
  { href: "/tools/rosters", label: "רשימות שחקנים", icon: Users },
  { href: "/tools/fitness", label: "עדכון מד כושר", icon: Gauge },
];

export const toolCards: ToolCard[] = [
  {
    href: "/tools/cleanup",
    title: "ארכיון פעילויות",
    description:
      "ארכיון החוגים, האירועים והתחרויות שהסתיימו — עם אפשרות למחוק פעילויות מהארכיון.",
    icon: Archive,
  },
  {
    href: "/tools/missing-attendance",
    title: "עדכון נוכחות חסרה",
    description:
      "רשימת החוגים שבהם נותרו מפגשים שלא הוזנה בהם נוכחות, כדי להשלים אותם במהירות.",
    icon: ClipboardX,
  },
  {
    href: "/tools/whatsapp",
    title: "שליחת וואטסאפ",
    description:
      "יצירת הודעת הזמנה לתחרויות ולחוגים לפי שעות וטווח מד״כ, עם תבניות הערות לשמירה.",
    icon: MessageCircle,
  },
  {
    href: "/tools/rosters",
    title: "רשימות שחקנים",
    description:
      "שמירת רשימת שחקנים מפעילות אחת וייצוא או העתקה שלה אל פעילות אחרת.",
    icon: Users,
  },
  {
    href: "/tools/fitness",
    title: "עדכון מד כושר מרוכז",
    description:
      "עדכון מד כושר לכמה שחקנים בבת אחת — ישירות בטבלה או דרך ייצוא וייבוא של קובץ אקסל.",
    icon: Gauge,
  },
];
