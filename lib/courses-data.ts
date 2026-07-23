// The live status is derived from the course's sessions in useCoursesData — see
// lib/activity-timing.ts: "ללא פעילות" when it has no sessions at all, otherwise
// פעיל / מתוכנן / הסתיים. "ארכיון" is a separate, manually-set state.
export type CourseStatus =
  | "פעיל"
  | "מתוכנן"
  | "הסתיים"
  | "ללא פעילות"
  | "ארכיון";

/** How full a course is — derived from enrolled vs. capacity, never set by hand. */
export type CourseOccupancy = "ריק" | "חלקי" | "מלא";

/**
 * ריק when no one is enrolled, מלא at/over capacity, חלקי in between.
 * A missing capacity means "unlimited" — such an activity is never מלא.
 */
export function courseOccupancy(
  enrolled: number,
  capacity: number | undefined,
): CourseOccupancy {
  if (enrolled <= 0) return "ריק";
  if (hasCapacity(capacity) && enrolled >= capacity) return "מלא";
  return "חלקי";
}

/** A capacity is only a real limit when it is a positive number. */
function hasCapacity(capacity: number | undefined): capacity is number {
  return typeof capacity === "number" && capacity > 0;
}

/**
 * The capacity to chart against when none is set. Unlimited activities have no
 * ceiling, so the dashboard bar needs an arbitrary one to draw a share of.
 */
export const UNLIMITED_CAPACITY = 99;

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

/** A meeting time window, "HH:mm". */
export interface DayTime {
  start: string;
  end: string;
}

/** The time a recurring activity meets on each of its weekdays. */
export type WeeklyTimes = Partial<Record<CourseDay, DayTime>>;

/** "16:00"+"18:30" → "16:00–18:30"; missing → "—". */
export function formatDayTime(t: DayTime | undefined): string {
  return t ? `${t.start}–${t.end}` : "—";
}

export interface Course {
  id: string;
  name: string;
  coach: string;
  ageMin: number;
  ageMax: number;
  ratingMin: number;
  ratingMax: number;
  /** When true, the course accepts any age / rating (the min/max are ignored). */
  noAgeLimit?: boolean;
  noRatingLimit?: boolean;
  enrolled: number;
  /** Max students. Absent / 0 = unlimited — the course is never "מלא". */
  capacity?: number;
  days: CourseDay[];
  /** The meeting time on each weekday the course runs (optional legacy data). */
  times?: WeeklyTimes;
  nextDate: string;
  status: CourseStatus;
  /** Derived from enrolled/capacity (see courseOccupancy) — not authored. */
  occupancy: CourseOccupancy;
  room: string;
  /** Free-text notes, persisted in Firestore. */
  notes?: string;
}

const OVER_DATE = "—";

// Occupancy is derived below, so the source rows omit it.
const rawCourses: Omit<Course, "occupancy">[] = [
  { id: "course-1",  name: "שחמט מתחילים",       coach: "אבי לוי",     ageMin: 6,  ageMax: 9,  ratingMin: 0,    ratingMax: 800,  enrolled: 14, capacity: 18, days: ["ראשון", "שלישי"],        nextDate: "07.06.2026", status: "פעיל", room: "כיתה א׳" },
  { id: "course-2",  name: "שחמט מתקדמים",       coach: "יוסי בן עמי", ageMin: 10, ageMax: 14, ratingMin: 800,  ratingMax: 1600, enrolled: 18, capacity: 18, days: ["שני", "רביעי"],            nextDate: "09.06.2026", status: "פעיל", room: "אולם ראשי" },
  { id: "course-3",  name: "מועדון אחה״צ",       coach: "מירב כהן",    ageMin: 7,  ageMax: 12, ratingMin: 400,  ratingMax: 1200, enrolled: 9,  capacity: 16, days: ["חמישי"],                   nextDate: "11.06.2026", status: "פעיל", room: "כיתה ב׳" },
  { id: "course-4",  name: "אימון קבוצתי",       coach: "דנה אביב",    ageMin: 13, ageMax: 17, ratingMin: 1200, ratingMax: 2200, enrolled: 7,  capacity: 12, days: ["שני", "חמישי"],            nextDate: "08.06.2026", status: "פעיל", room: "אולם תחרויות" },
  { id: "course-5",  name: "שחמט בוגרים",        coach: "רון פרידמן",  ageMin: 18, ageMax: 99, ratingMin: 1400, ratingMax: 2400, enrolled: 11, capacity: 20, days: ["שלישי"],                   nextDate: "10.06.2026", status: "פעיל", room: "אולם ראשי" },
  { id: "course-6",  name: "סדנת פתיחות",        coach: "אורן שגב",    ageMin: 12, ageMax: 18, ratingMin: 1000, ratingMax: 1800, enrolled: 6,  capacity: 14, days: ["רביעי"],                   nextDate: "10.06.2026", status: "פעיל", room: "חדר אנליזה" },
  { id: "course-7",  name: "חוג גן",             coach: "ליאת מור",    ageMin: 4,  ageMax: 6,  ratingMin: 0,    ratingMax: 400,  enrolled: 12, capacity: 14, days: ["ראשון", "רביעי"],          nextDate: "07.06.2026", status: "פעיל", room: "כיתה ב׳" },
  { id: "course-8",  name: "ליגת בית הספר",      coach: "גיא רביב",    ageMin: 8,  ageMax: 13, ratingMin: 600,  ratingMax: 1400, enrolled: 16, capacity: 18, days: ["שני", "שלישי", "חמישי"],   nextDate: "08.06.2026", status: "פעיל", room: "אולם ראשי" },
  { id: "course-9",  name: "סוף שבוע",           coach: "שירה גל",     ageMin: 7,  ageMax: 14, ratingMin: 500,  ratingMax: 1500, enrolled: 10, capacity: 20, days: ["שישי", "שבת"],             nextDate: "12.06.2026", status: "פעיל", room: "אולם ראשי" },
  { id: "course-10", name: "קמפ אינטנסיבי",      coach: "עידן הראל",   ageMin: 10, ageMax: 16, ratingMin: 1200, ratingMax: 2000, enrolled: 8,  capacity: 10, days: ["ראשון", "שני", "שלישי", "רביעי", "חמישי"], nextDate: "07.06.2026", status: "פעיל", room: "חדר אנליזה" },
  { id: "course-11", name: "מתחילים אחה״צ",       coach: "נועה ברק",    ageMin: 6,  ageMax: 10, ratingMin: 0,    ratingMax: 700,  enrolled: 4,  capacity: 16, days: ["רביעי"],                   nextDate: OVER_DATE,    status: "פעיל", room: "כיתה א׳" },
  { id: "course-12", name: "טורניר חמישי",       coach: "אייל סופר",   ageMin: 9,  ageMax: 17, ratingMin: 800,  ratingMax: 1900, enrolled: 13, capacity: 14, days: ["חמישי"],                   nextDate: "11.06.2026", status: "פעיל", room: "אולם תחרויות" },
  { id: "course-13", name: "חוג בוקר",           coach: "מעיין דקל",   ageMin: 18, ageMax: 99, ratingMin: 1000, ratingMax: 1800, enrolled: 5,  capacity: 12, days: ["שני"],                     nextDate: "08.06.2026", status: "פעיל", room: "כיתה ב׳" },
  { id: "course-14", name: "כיתות נמוכות",       coach: "אלון זיו",    ageMin: 6,  ageMax: 8,  ratingMin: 100,  ratingMax: 600,  enrolled: 15, capacity: 18, days: ["שלישי", "חמישי"],          nextDate: "09.06.2026", status: "פעיל", room: "כיתה א׳" },
  { id: "course-15", name: "כיתות בינוניות",     coach: "הילה כספי",   ageMin: 9,  ageMax: 12, ratingMin: 600,  ratingMax: 1300, enrolled: 11, capacity: 16, days: ["ראשון", "רביעי"],          nextDate: "07.06.2026", status: "פעיל", room: "כיתה ב׳" },
  { id: "course-16", name: "אלופים",              coach: "נדב אורן",    ageMin: 14, ageMax: 20, ratingMin: 1800, ratingMax: 2600, enrolled: 6,  capacity: 8,  days: ["שני", "חמישי"],            nextDate: "08.06.2026", status: "פעיל", room: "חדר אנליזה" },
  { id: "course-17", name: "חוג שישי",            coach: "רעות שני",    ageMin: 8,  ageMax: 14, ratingMin: 700,  ratingMax: 1500, enrolled: 9,  capacity: 16, days: ["שישי"],                    nextDate: "12.06.2026", status: "פעיל", room: "כיתה א׳" },
  { id: "course-18", name: "מועדון בוגרים",       coach: "ליאור פז",    ageMin: 18, ageMax: 99, ratingMin: 1300, ratingMax: 2200, enrolled: 3,  capacity: 14, days: ["שלישי"],                   nextDate: OVER_DATE,    status: "הסתיים", room: "אולם ראשי" },
  { id: "course-19", name: "הכנה לתחרויות",        coach: "מתן יערי",    ageMin: 11, ageMax: 17, ratingMin: 1400, ratingMax: 2200, enrolled: 12, capacity: 12, days: ["ראשון", "רביעי"],          nextDate: "07.06.2026", status: "פעיל", room: "אולם תחרויות" },
  { id: "course-20", name: "חוג שבת",             coach: "תמר אלון",    ageMin: 7,  ageMax: 13, ratingMin: 400,  ratingMax: 1300, enrolled: 7,  capacity: 18, days: ["שבת"],                     nextDate: "13.06.2026", status: "פעיל", room: "כיתה ב׳" },
];

// A class with no upcoming date (המועד הבא) is over → status "הסתיים".
// Occupancy is derived from enrolled/capacity for every course.
export const courses: Course[] = rawCourses.map((a) => ({
  ...a,
  status: a.nextDate === OVER_DATE ? "הסתיים" : a.status,
  occupancy: courseOccupancy(a.enrolled, a.capacity),
}));

// Archived courses never appear in the main table (they live only in the
// archive), so "ארכיון" is intentionally omitted from the filter options.
export const allCourseStatuses: CourseStatus[] = ["פעיל", "מתוכנן", "הסתיים", "ללא פעילות"];

export const allCourseOccupancies: CourseOccupancy[] = ["ריק", "חלקי", "מלא"];

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
