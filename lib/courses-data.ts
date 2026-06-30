import { OUTSIDE_CLUB_ROOM } from "@/lib/rooms-data";

export type CourseStatus = "פעיל" | "מלא" | "לא פעיל";

export const COURSE_DAYS = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
] as const;

export type CourseDay = (typeof COURSE_DAYS)[number];

export interface Course {
  id: string;
  name: string;
  coach: string;
  ageMin: number;
  ageMax: number;
  fitnessMin: number;
  fitnessMax: number;
  enrolled: number;
  capacity: number;
  days: CourseDay[];
  nextDate: string;
  status: CourseStatus;
  room: string;
}

const OVER_DATE = "—";

const rawCourses: Course[] = [
  { id: "course-1",  name: "שחמט מתחילים",       coach: "אבי לוי",     ageMin: 6,  ageMax: 9,  fitnessMin: 0,    fitnessMax: 800,  enrolled: 14, capacity: 18, days: ["ראשון", "שלישי"],        nextDate: "07.06.2026", status: "פעיל", room: "כיתה א׳" },
  { id: "course-2",  name: "שחמט מתקדמים",       coach: "יוסי בן עמי", ageMin: 10, ageMax: 14, fitnessMin: 800,  fitnessMax: 1600, enrolled: 18, capacity: 18, days: ["שני", "רביעי"],            nextDate: "09.06.2026", status: "מלא", room: "אולם ראשי" },
  { id: "course-3",  name: "מועדון אחה״צ",       coach: "מירב כהן",    ageMin: 7,  ageMax: 12, fitnessMin: 400,  fitnessMax: 1200, enrolled: 9,  capacity: 16, days: ["חמישי"],                   nextDate: "11.06.2026", status: "פעיל", room: "כיתה ב׳" },
  { id: "course-4",  name: "אימון קבוצתי",       coach: "דנה אביב",    ageMin: 13, ageMax: 17, fitnessMin: 1200, fitnessMax: 2200, enrolled: 7,  capacity: 12, days: ["שני", "חמישי"],            nextDate: "08.06.2026", status: "פעיל", room: "אולם תחרויות" },
  { id: "course-5",  name: "שחמט בוגרים",        coach: "רון פרידמן",  ageMin: 18, ageMax: 99, fitnessMin: 1400, fitnessMax: 2400, enrolled: 11, capacity: 20, days: ["שלישי"],                   nextDate: "10.06.2026", status: "פעיל", room: "אולם ראשי" },
  { id: "course-6",  name: "סדנת פתיחות",        coach: "אורן שגב",    ageMin: 12, ageMax: 18, fitnessMin: 1000, fitnessMax: 1800, enrolled: 6,  capacity: 14, days: ["רביעי"],                   nextDate: "10.06.2026", status: "פעיל", room: "חדר אנליזה" },
  { id: "course-7",  name: "חוג גן",             coach: "ליאת מור",    ageMin: 4,  ageMax: 6,  fitnessMin: 0,    fitnessMax: 400,  enrolled: 12, capacity: 14, days: ["ראשון", "רביעי"],          nextDate: "07.06.2026", status: "פעיל", room: "כיתה ב׳" },
  { id: "course-8",  name: "ליגת בית הספר",      coach: "גיא רביב",    ageMin: 8,  ageMax: 13, fitnessMin: 600,  fitnessMax: 1400, enrolled: 16, capacity: 18, days: ["שני", "שלישי", "חמישי"],   nextDate: "08.06.2026", status: "פעיל", room: "אולם ראשי" },
  { id: "course-9",  name: "סוף שבוע",           coach: "שירה גל",     ageMin: 7,  ageMax: 14, fitnessMin: 500,  fitnessMax: 1500, enrolled: 10, capacity: 20, days: ["שישי", "שבת"],             nextDate: "12.06.2026", status: "פעיל", room: "אולם ראשי" },
  { id: "course-10", name: "קמפ אינטנסיבי",      coach: "עידן הראל",   ageMin: 10, ageMax: 16, fitnessMin: 1200, fitnessMax: 2000, enrolled: 8,  capacity: 10, days: ["ראשון", "שני", "שלישי", "רביעי", "חמישי"], nextDate: "07.06.2026", status: "פעיל", room: "חדר אנליזה" },
  { id: "course-11", name: "מתחילים אחה״צ",       coach: "נועה ברק",    ageMin: 6,  ageMax: 10, fitnessMin: 0,    fitnessMax: 700,  enrolled: 4,  capacity: 16, days: ["רביעי"],                   nextDate: OVER_DATE,    status: "פעיל", room: "כיתה א׳" },
  { id: "course-12", name: "טורניר חמישי",       coach: "אייל סופר",   ageMin: 9,  ageMax: 17, fitnessMin: 800,  fitnessMax: 1900, enrolled: 13, capacity: 14, days: ["חמישי"],                   nextDate: "11.06.2026", status: "פעיל", room: "אולם תחרויות" },
  { id: "course-13", name: "חוג בוקר",           coach: "מעיין דקל",   ageMin: 18, ageMax: 99, fitnessMin: 1000, fitnessMax: 1800, enrolled: 5,  capacity: 12, days: ["שני"],                     nextDate: "08.06.2026", status: "פעיל", room: "כיתה ב׳" },
  { id: "course-14", name: "כיתות נמוכות",       coach: "אלון זיו",    ageMin: 6,  ageMax: 8,  fitnessMin: 100,  fitnessMax: 600,  enrolled: 15, capacity: 18, days: ["שלישי", "חמישי"],          nextDate: "09.06.2026", status: "פעיל", room: "כיתה א׳" },
  { id: "course-15", name: "כיתות בינוניות",     coach: "הילה כספי",   ageMin: 9,  ageMax: 12, fitnessMin: 600,  fitnessMax: 1300, enrolled: 11, capacity: 16, days: ["ראשון", "רביעי"],          nextDate: "07.06.2026", status: "פעיל", room: "כיתה ב׳" },
  { id: "course-16", name: "אלופים",              coach: "נדב אורן",    ageMin: 14, ageMax: 20, fitnessMin: 1800, fitnessMax: 2600, enrolled: 6,  capacity: 8,  days: ["שני", "חמישי"],            nextDate: "08.06.2026", status: "פעיל", room: "חדר אנליזה" },
  { id: "course-17", name: "חוג שישי",            coach: "רעות שני",    ageMin: 8,  ageMax: 14, fitnessMin: 700,  fitnessMax: 1500, enrolled: 9,  capacity: 16, days: ["שישי"],                    nextDate: "12.06.2026", status: "פעיל", room: "כיתה א׳" },
  { id: "course-18", name: "מועדון בוגרים",       coach: "ליאור פז",    ageMin: 18, ageMax: 99, fitnessMin: 1300, fitnessMax: 2200, enrolled: 3,  capacity: 14, days: ["שלישי"],                   nextDate: OVER_DATE,    status: "לא פעיל", room: "אולם ראשי" },
  { id: "course-19", name: "הכנה לתחרויות",        coach: "מתן יערי",    ageMin: 11, ageMax: 17, fitnessMin: 1400, fitnessMax: 2200, enrolled: 12, capacity: 12, days: ["ראשון", "רביעי"],          nextDate: "07.06.2026", status: "מלא", room: "אולם תחרויות" },
  { id: "course-20", name: "חוג שבת",             coach: "תמר אלון",    ageMin: 7,  ageMax: 13, fitnessMin: 400,  fitnessMax: 1300, enrolled: 7,  capacity: 18, days: ["שבת"],                     nextDate: "13.06.2026", status: "פעיל", room: "כיתה ב׳" },
];

// A class with no upcoming date (המועד הבא) is over → status is forced to "לא פעיל".
export const courses: Course[] = rawCourses.map((a) =>
  a.nextDate === OVER_DATE ? { ...a, status: "לא פעיל" } : a,
);

export const allCourseCoaches = Array.from(
  new Set(courses.map((a) => a.coach)),
).sort((a, b) => a.localeCompare(b, "he"));

export const allCourseStatuses: CourseStatus[] = ["פעיל", "מלא", "לא פעיל"];

export const allCourseRooms = Array.from(
  new Set([...courses.map((a) => a.room), OUTSIDE_CLUB_ROOM]),
).sort((a, b) => a.localeCompare(b, "he"));

const HEBREW_DAY_BY_JS: Record<number, CourseDay> = {
  0: "ראשון",
  1: "שני",
  2: "שלישי",
  3: "רביעי",
  4: "חמישי",
  5: "שישי",
  6: "שבת",
};

export function todayHebrewDay(date: Date = new Date()): CourseDay {
  return HEBREW_DAY_BY_JS[date.getDay()];
}
