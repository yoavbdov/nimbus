/** The support team's contact address, shown on the support page. */
export const SUPPORT_EMAIL = "support@chessnimbus.com";

/** What kind of help the user is asking for. */
export type SupportCategory =
  | "technical"
  | "billing"
  | "feature"
  | "account"
  | "other";

export const SUPPORT_CATEGORY_OPTIONS: {
  value: SupportCategory;
  label: string;
}[] = [
  { value: "technical", label: "תקלה טכנית" },
  { value: "billing", label: "חיובים ותשלומים" },
  { value: "feature", label: "בקשת פיצ'ר" },
  { value: "account", label: "ניהול חשבון" },
  { value: "other", label: "אחר" },
];

/** How urgent the request is. */
export type SupportPriority = "low" | "medium" | "high" | "urgent";

export const SUPPORT_PRIORITY_OPTIONS: {
  value: SupportPriority;
  label: string;
}[] = [
  { value: "low", label: "נמוכה" },
  { value: "medium", label: "רגילה" },
  { value: "high", label: "גבוהה" },
  { value: "urgent", label: "דחופה" },
];

/** Which part of the app the request is about. */
export type SupportArea =
  | "players"
  | "coaches"
  | "classes"
  | "tournaments"
  | "schedule"
  | "rooms"
  | "attendance"
  | "leagues"
  | "other";

export const SUPPORT_AREA_OPTIONS: { value: SupportArea; label: string }[] = [
  { value: "players", label: "שחקנים" },
  { value: "coaches", label: "מדריכים" },
  { value: "classes", label: "חוגים" },
  { value: "tournaments", label: "תחרויות ואירועים" },
  { value: "schedule", label: "לוח זמנים" },
  { value: "rooms", label: "חדרים וציוד" },
  { value: "attendance", label: "נוכחות" },
  { value: "leagues", label: "קבוצות ליגה" },
  { value: "other", label: "אחר" },
];

/** Shape of the "open a support ticket" form. Empty strings = not filled yet. */
export interface SupportFormValues {
  category: SupportCategory | "";
  /** Free-text used only when {@link category} is "other". */
  customCategory: string;
  priority: SupportPriority;
  area: SupportArea | "";
  subject: string;
  description: string;
}

export const EMPTY_SUPPORT_FORM: SupportFormValues = {
  category: "",
  customCategory: "",
  priority: "medium",
  area: "",
  subject: "",
  description: "",
};

/**
 * A category, a subject and a description are required. When the category is
 * "other", the free-text description of it is required too.
 */
export function isSupportFormValid(values: SupportFormValues): boolean {
  if (!values.category) return false;
  if (values.category === "other" && !values.customCategory.trim()) {
    return false;
  }
  return Boolean(values.subject.trim() && values.description.trim());
}

/** Lifecycle of a submitted ticket. */
export type SupportStatus = "new" | "in_progress" | "closed";

export const SUPPORT_STATUS_LABELS: Record<SupportStatus, string> = {
  new: "חדש",
  in_progress: "בטיפול",
  closed: "נסגר",
};

/** Who wrote a message in a ticket thread. */
export type SupportAuthor = "user" | "agent";

/** A single message in a ticket's conversation. */
export interface SupportMessage {
  id: string;
  author: SupportAuthor;
  authorName: string;
  body: string;
  /** Display timestamp, e.g. "11/06/2026 09:42". */
  at: string;
  /** File names attached to this message, if any. */
  attachments?: string[];
}

/** A ticket as shown in the "my tickets" list. */
export interface SupportTicket {
  id: string;
  subject: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  /** ISO date the ticket was opened. */
  createdAt: string;
  /** The full conversation so far, oldest first. */
  messages: SupportMessage[];
}

/**
 * Stand-in tickets for the list. There is no backend yet, so these are shown
 * to demonstrate how submitted tickets would appear.
 */
export const SAMPLE_TICKETS: SupportTicket[] = [
  {
    id: "NIM-1042",
    subject: "ייצוא נוכחות לאקסל נכשל",
    category: "technical",
    priority: "high",
    status: "in_progress",
    createdAt: "2026-06-11",
    messages: [
      {
        id: "m1",
        author: "user",
        authorName: "אני",
        body: "בכל פעם שאני מנסה לייצא את דוח הנוכחות לאקסל מתקבלת שגיאה והקובץ לא נוצר.",
        at: "11/06/2026 09:42",
      },
      {
        id: "m2",
        author: "agent",
        authorName: "צוות התמיכה",
        body: "תודה על הפנייה. באיזה דפדפן אתם משתמשים, והאם השגיאה מופיעה גם בייצוא של חוג בודד?",
        at: "11/06/2026 10:15",
      },
      {
        id: "m3",
        author: "user",
        authorName: "אני",
        body: "Chrome, והשגיאה מופיעה גם בייצוא של חוג בודד. מצרף צילום מסך של השגיאה.",
        at: "11/06/2026 10:28",
        attachments: ["שגיאת-ייצוא.png"],
      },
      {
        id: "m4",
        author: "agent",
        authorName: "צוות התמיכה",
        body: "קיבלנו, הצוות הטכני בודק את הנושא. נעדכן אתכם בהקדם.",
        at: "11/06/2026 11:02",
      },
      {
        id: "m5",
        author: "user",
        authorName: "אני",
        body: "תודה. רק לידיעתכם, זה דחוף יחסית כי אני צריך להגיש את דוחות הנוכחות עד סוף השבוע.",
        at: "11/06/2026 11:10",
      },
      {
        id: "m6",
        author: "agent",
        authorName: "צוות התמיכה",
        body: "מובן לחלוטין, נטפל בזה בעדיפות. בינתיים, האם תוכלו לנסות לייצא דרך גלישה בסתר (incognito) ולעדכן אם זה עוזר?",
        at: "11/06/2026 11:24",
      },
      {
        id: "m7",
        author: "user",
        authorName: "אני",
        body: "ניסיתי בגלישה בסתר ועדיין מקבל את אותה השגיאה.",
        at: "11/06/2026 11:38",
      },
      {
        id: "m8",
        author: "agent",
        authorName: "צוות התמיכה",
        body: "תודה על הבדיקה. שחזרנו את התקלה אצלנו — נראה שהיא קשורה לחוגים עם שמות הכוללים תווים מיוחדים. אנחנו עובדים על תיקון.",
        at: "11/06/2026 12:05",
      },
      {
        id: "m9",
        author: "user",
        authorName: "אני",
        body: "הגיוני, לאחד החוגים שלי יש סוגריים בשם. יש הערכת זמן לתיקון?",
        at: "11/06/2026 12:14",
      },
      {
        id: "m10",
        author: "agent",
        authorName: "צוות התמיכה",
        body: "אנחנו מצפים להעלות תיקון עוד היום אחר הצהריים. כעקיפה זמנית, ניתן לשנות זמנית את שם החוג כך שלא יכלול סוגריים ולנסות שוב את הייצוא.",
        at: "11/06/2026 12:30",
      },
      {
        id: "m11",
        author: "user",
        authorName: "אני",
        body: "ניסיתי את העקיפה והייצוא עבד! תודה רבה. אשמח לעדכון כשהתיקון הקבוע יעלה.",
        at: "11/06/2026 12:52",
      },
      {
        id: "m12",
        author: "agent",
        authorName: "צוות התמיכה",
        body: "מצוין לשמוע! נשאיר את הפנייה פתוחה עד שנוודא שהתיקון הקבוע נפרס. מצרפים מסמך עם פירוט העקיפה למקרה הצורך.",
        at: "11/06/2026 13:05",
        attachments: ["עקיפה-זמנית-ייצוא.pdf"],
      },
      {
        id: "m13",
        author: "agent",
        authorName: "צוות התמיכה",
        body: "עדכון: התיקון נפרס לסביבת הבדיקות ונמצא בבדיקות אחרונות לפני עלייה לאוויר.",
        at: "11/06/2026 15:20",
      },
      {
        id: "m14",
        author: "user",
        authorName: "אני",
        body: "מעולה, תודה על העדכון השוטף.",
        at: "11/06/2026 15:28",
      },
      {
        id: "m15",
        author: "agent",
        authorName: "צוות התמיכה",
        body: "התיקון עלה לאוויר. נשמח אם תאשרו שהייצוא עובד גם ללא העקיפה, ואז נוכל לסגור את הפנייה.",
        at: "11/06/2026 16:45",
      },
    ],
  },
  {
    id: "NIM-1038",
    subject: "בקשה להוספת סינון לפי מד כושר",
    category: "feature",
    priority: "low",
    status: "new",
    createdAt: "2026-06-09",
    messages: [
      {
        id: "m1",
        author: "user",
        authorName: "אני",
        body: "יהיה נהדר אם אפשר יהיה לסנן את רשימת השחקנים לפי טווח מד כושר.",
        at: "09/06/2026 14:20",
      },
    ],
  },
  {
    id: "NIM-1025",
    subject: "חיוב כפול בחשבונית מאי",
    category: "billing",
    priority: "urgent",
    status: "closed",
    createdAt: "2026-05-28",
    messages: [
      {
        id: "m1",
        author: "user",
        authorName: "אני",
        body: "חויבתי פעמיים על מנוי מאי. אשמח להחזר.",
        at: "28/05/2026 08:05",
      },
      {
        id: "m2",
        author: "agent",
        authorName: "צוות התמיכה",
        body: "בדקנו ואכן נוצר חיוב כפול. ביצענו זיכוי שיופיע תוך 3 ימי עסקים. מתנצלים על אי הנוחות.",
        at: "28/05/2026 12:40",
      },
    ],
  },
  {
    id: "NIM-1011",
    subject: "לא ניתן לשחזר סיסמה",
    category: "account",
    priority: "medium",
    status: "closed",
    createdAt: "2026-05-14",
    messages: [
      {
        id: "m1",
        author: "user",
        authorName: "אני",
        body: "מייל איפוס הסיסמה לא מגיע אליי.",
        at: "14/05/2026 16:11",
      },
      {
        id: "m2",
        author: "agent",
        authorName: "צוות התמיכה",
        body: "המייל היה נחסם בתיקיית הספאם. לאחר הוספה לרשימת השולחים המאושרים הבעיה נפתרה.",
        at: "14/05/2026 17:30",
      },
    ],
  },
];
