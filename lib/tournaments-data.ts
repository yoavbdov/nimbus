import { type CourseDay, type WeeklyTimes } from "@/lib/courses-data";
import { OUTSIDE_CLUB_ROOM } from "@/lib/rooms-data";

export type { CourseDay };

export type TournamentStatus = "פעילה" | "הסתיימה" | "מתוכננת" | "ללא פעילות" | "ארכיון";

export interface Tournament {
  id: string;
  name: string;
  judge: string;
  status: TournamentStatus;
  rounds: number;
  days: CourseDay[];
  /** The meeting time on each weekday the tournament runs. */
  times?: WeeklyTimes;
  nextDate: string;
  participants: number;
  ratingMin: number;
  ratingMax: number;
  /** Age range the tournament is open to (optional: legacy rows omit it). */
  ageMin?: number;
  ageMax?: number;
  /** When true, the tournament accepts any age / rating (the min/max are ignored). */
  noAgeLimit?: boolean;
  noRatingLimit?: boolean;
  room: string;
  /** Free-text notes, persisted in Firestore. */
  notes?: string;
}

const OVER_DATE = "—";

const rawTournaments: Tournament[] = [
  { id: "tournament-1",  name: "אליפות החורף",      judge: "אבי לוי",     status: "פעילה",   rounds: 7,  days: ["ראשון", "שלישי"],        nextDate: "12.06.2026", participants: 64, ratingMin: 1200, ratingMax: 2400, room: "אולם תחרויות" },
  { id: "tournament-2",  name: "גביע הנוער",        judge: "דנה אביב",    status: "מתוכננת", rounds: 5,  days: ["שני", "רביעי"],          nextDate: "20.06.2026", participants: 32, ratingMin: 800,  ratingMax: 1600, room: "אולם ראשי" },
  { id: "tournament-3",  name: "טורניר בזק מהיר",   judge: "רון פרידמן",  status: "פעילה",   rounds: 9,  days: ["חמישי"],                 nextDate: "08.06.2026", participants: 48, ratingMin: 1000, ratingMax: 2200, room: "אולם תחרויות" },
  { id: "tournament-4",  name: "אליפות הגן",        judge: "מירב כהן",    status: "פעילה",   rounds: 4,  days: ["ראשון"],                 nextDate: OVER_DATE,    participants: 24, ratingMin: 0,    ratingMax: 600,  room: "כיתה א׳" },
  { id: "tournament-5",  name: "ליגת הבוגרים",      judge: "גיא רביב",    status: "פעילה",   rounds: 11, days: ["שלישי", "חמישי"],        nextDate: "15.06.2026", participants: 40, ratingMin: 1400, ratingMax: 2600, room: "אולם תחרויות" },
  { id: "tournament-6",  name: "גביע סוף השבוע",    judge: "שירה גל",     status: "מתוכננת", rounds: 6,  days: ["שישי", "שבת"],           nextDate: "27.06.2026", participants: 28, ratingMin: 600,  ratingMax: 1500, room: "אולם ראשי" },
  { id: "tournament-7",  name: "טורניר בית הספר",   judge: "אבי לוי",     status: "פעילה",   rounds: 5,  days: ["שני", "חמישי"],          nextDate: "11.06.2026", participants: 36, ratingMin: 600,  ratingMax: 1400, room: "כיתה ב׳" },
  { id: "tournament-8",  name: "אליפות הקיץ",       judge: "עידן הראל",   status: "מתוכננת", rounds: 9,  days: ["ראשון", "שלישי"],        nextDate: "03.07.2026", participants: 80, ratingMin: 1200, ratingMax: 2500, room: "אולם תחרויות" },
  { id: "tournament-9",  name: "טורניר המתחילים",   judge: "נועה ברק",    status: "פעילה",   rounds: 3,  days: ["רביעי"],                 nextDate: OVER_DATE,    participants: 20, ratingMin: 0,    ratingMax: 800,  room: "כיתה א׳" },
  { id: "tournament-10", name: "גביע האלופים",      judge: "נדב אורן",    status: "פעילה",   rounds: 8,  days: ["שני", "חמישי"],          nextDate: "14.06.2026", participants: 16, ratingMin: 1800, ratingMax: 2800, room: "חדר אנליזה" },
  { id: "tournament-11", name: "טורניר אחה״צ",      judge: "דנה אביב",    status: "מתוכננת", rounds: 5,  days: ["רביעי"],                 nextDate: "22.06.2026", participants: 30, ratingMin: 400,  ratingMax: 1300, room: "כיתה ב׳" },
  { id: "tournament-12", name: "אליפות הבזק",       judge: "רון פרידמן",  status: "פעילה",   rounds: 13, days: ["שלישי"],                 nextDate: "09.06.2026", participants: 56, ratingMin: 1000, ratingMax: 2300, room: "אולם תחרויות" },
  { id: "tournament-13", name: "טורניר הסתיו",      judge: "גיא רביב",    status: "פעילה",   rounds: 7,  days: ["שני", "שלישי", "חמישי"], nextDate: OVER_DATE,    participants: 44, ratingMin: 1100, ratingMax: 2100, room: "אולם ראשי" },
  { id: "tournament-14", name: "גביע הכיתות",       judge: "מירב כהן",    status: "מתוכננת", rounds: 4,  days: ["ראשון", "רביעי"],        nextDate: "25.06.2026", participants: 38, ratingMin: 500,  ratingMax: 1200, room: "כיתה א׳" },
  { id: "tournament-15", name: "ליגת הנוער",        judge: "שירה גל",     status: "פעילה",   rounds: 9,  days: ["ראשון", "רביעי"],        nextDate: "13.06.2026", participants: 52, ratingMin: 900,  ratingMax: 1900, room: "אולם ראשי" },
  { id: "tournament-16", name: "אליפות הפתיחות",    judge: "נדב אורן",    status: "מתוכננת", rounds: 6,  days: ["שני"],                   nextDate: "30.06.2026", participants: 26, ratingMin: 1300, ratingMax: 2200, room: "חדר אנליזה" },
  { id: "tournament-17", name: "טורניר שישי",       judge: "אבי לוי",     status: "פעילה",   rounds: 5,  days: ["שישי"],                  nextDate: "12.06.2026", participants: 34, ratingMin: 700,  ratingMax: 1600, room: "כיתה ב׳" },
  { id: "tournament-18", name: "גביע המאסטרים",     judge: "עידן הראל",   status: "מתוכננת", rounds: 10, days: ["שלישי", "חמישי"],        nextDate: "05.07.2026", participants: 12, ratingMin: 2000, ratingMax: 2900, room: "חדר אנליזה" },
  { id: "tournament-19", name: "טורניר הבוקר",      judge: "נועה ברק",    status: "פעילה",   rounds: 4,  days: ["שני"],                   nextDate: OVER_DATE,    participants: 18, ratingMin: 1000, ratingMax: 1800, room: "כיתה א׳" },
  { id: "tournament-20", name: "אליפות סוף העונה",  judge: "נדב אורן",    status: "מתוכננת", rounds: 11, days: ["ראשון", "רביעי"],        nextDate: "10.07.2026", participants: 72, ratingMin: 1200, ratingMax: 2600, room: "אולם תחרויות" },
];

// A tournament with no upcoming date (המועד הבא) is over → status is forced to "הסתיימה".
export const tournaments: Tournament[] = rawTournaments.map((t) =>
  t.nextDate === OVER_DATE ? { ...t, status: "הסתיימה" } : t,
);

export const allTournamentJudges = Array.from(
  new Set(tournaments.map((t) => t.judge)),
).sort((a, b) => a.localeCompare(b, "he"));

// Archived tournaments never appear in the main table (they live only in the
// archive), so "ארכיון" is intentionally omitted from the filter options.
export const allTournamentStatuses: TournamentStatus[] = [
  "פעילה",
  "הסתיימה",
  "מתוכננת",
  "ללא פעילות",
];

export const allTournamentRooms = Array.from(
  new Set([...tournaments.map((t) => t.room), OUTSIDE_CLUB_ROOM]),
).sort((a, b) => a.localeCompare(b, "he"));
