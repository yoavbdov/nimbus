import { type CourseDay } from "@/lib/courses-data";

export type { CourseDay };

export type EventStatus = "פעיל" | "הסתיים" | "מתוכנן" | "ללא פעילות" | "ארכיון";

/** קבוע = recurring, חד פעמי = one-off. */
export type EventRecurrence = "קבוע" | "חד פעמי";

export interface ClubEvent {
  id: string;
  name: string;
  days: CourseDay[];
  nextDate: string;
  status: EventStatus;
  recurrence: EventRecurrence;
  room: string;
  /** Free-text notes, persisted in Firestore. */
  notes?: string;
}

const OVER_DATE = "—";

const rawEvents: ClubEvent[] = [
  { id: "event-1",  name: "ערב פתיחת עונה",       days: ["ראשון"],            nextDate: "07.06.2026", status: "פעיל",    recurrence: "חד פעמי", room: "אולם ראשי" },
  { id: "event-2",  name: "מפגש הורים ומדריכים",  days: ["שני"],              nextDate: "08.06.2026", status: "מתוכנן",  recurrence: "חד פעמי", room: "כיתה ב׳" },
  { id: "event-3",  name: "סימולטנה עם אורח",     days: ["שלישי"],            nextDate: "09.06.2026", status: "פעיל",    recurrence: "חד פעמי", room: "אולם תחרויות" },
  { id: "event-4",  name: "מפגש סוף שבוע",        days: ["שישי", "שבת"],      nextDate: "12.06.2026", status: "פעיל",    recurrence: "קבוע",    room: "אולם ראשי" },
  { id: "event-5",  name: "הרצאת אורח",           days: ["רביעי"],            nextDate: "10.06.2026", status: "פעיל",    recurrence: "חד פעמי", room: "אולם ראשי" },
  { id: "event-6",  name: "טקס חלוקת גביעים",     days: ["חמישי"],            nextDate: OVER_DATE,    status: "הסתיים",  recurrence: "חד פעמי", room: "אולם תחרויות" },
  { id: "event-7",  name: "סדנת אסטרטגיה",        days: ["שני", "רביעי"],     nextDate: "15.06.2026", status: "מתוכנן",  recurrence: "קבוע",    room: "חדר אנליזה" },
  { id: "event-8",  name: "ערב משחקים חופשי",     days: ["שלישי"],            nextDate: "16.06.2026", status: "פעיל",    recurrence: "קבוע",    room: "כיתה א׳" },
  { id: "event-9",  name: "מפגש בוגרים",          days: ["שבת"],              nextDate: "13.06.2026", status: "פעיל",    recurrence: "קבוע",    room: "כיתה ב׳" },
  { id: "event-10", name: "יום שיא חגיגי",        days: ["שישי"],             nextDate: "19.06.2026", status: "מתוכנן",  recurrence: "חד פעמי", room: "אולם ראשי" },
  { id: "event-11", name: "מפגש קהילה",           days: ["ראשון", "רביעי"],   nextDate: "21.06.2026", status: "פעיל",    recurrence: "קבוע",    room: "אולם ראשי" },
  { id: "event-12", name: "ערב ניתוח משחקים",     days: ["שני"],              nextDate: OVER_DATE,    status: "הסתיים",  recurrence: "קבוע",    room: "חדר אנליזה" },
  { id: "event-13", name: "פתיחת מועדון קיץ",     days: ["ראשון"],            nextDate: "28.06.2026", status: "מתוכנן",  recurrence: "חד פעמי", room: "אולם ראשי" },
  { id: "event-14", name: "מפגש מתחילים",         days: ["חמישי"],            nextDate: "11.06.2026", status: "פעיל",    recurrence: "קבוע",    room: "כיתה א׳" },
  { id: "event-15", name: "ערב חידונים",          days: ["רביעי"],            nextDate: "24.06.2026", status: "מתוכנן",  recurrence: "חד פעמי", room: "כיתה ב׳" },
  { id: "event-16", name: "כנס שנתי",             days: ["שישי", "שבת"],      nextDate: "03.07.2026", status: "מתוכנן",  recurrence: "חד פעמי", room: "אולם תחרויות" },
];

// An event with no upcoming date (המועד הבא) is over → status is forced to "הסתיים".
export const events: ClubEvent[] = rawEvents.map((e) =>
  e.nextDate === OVER_DATE ? { ...e, status: "הסתיים" } : e,
);

export const allEventStatuses: EventStatus[] = ["פעיל", "מתוכנן", "הסתיים", "ללא פעילות"];

export const allEventRecurrences: EventRecurrence[] = ["קבוע", "חד פעמי"];
