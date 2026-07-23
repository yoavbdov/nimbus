/**
 * Curated seed dataset for Firestore (the demo club). This is intentionally
 * SMALL and internally consistent — a hand-built graph, decoupled from the
 * large UI mock arrays in lib/*-data.ts. The app still renders the mock arrays
 * until each button is migrated; the DB holds exactly this.
 *
 * Quantities (as requested):
 *   20 players (all ages), 6 coaches, 3 rooms, 3 equipment types,
 *   6 league teams (2 per category), 6 courses, 6 tournaments, 1 one-off event,
 *   2 attendance classes (left unmarked, to be filled in the app).
 *
 * Two extra fields beyond the UI types model the user's course/tournament
 * semantics; Firestore is schemaless so the app safely ignores them for now:
 *   recurrence: "קבוע" (permanent / ongoing) | "סבב" (a fixed round / cohort)
 *   timing is expressed via status + nextDate (future date = not started yet).
 *
 * Built conflicts live in `sessions` + `relations` — see the comment block at
 * the bottom and CONFLICTS in the seed output.
 */
import { deriveDetails } from "@/lib/player-details";
import type { PlayerBase } from "@/lib/players-data";
import {
  courseOccupancy,
  type Course,
  type CourseDay,
  type WeeklyTimes,
} from "@/lib/courses-data";
import { occurrencesInRange } from "@/lib/schedule-events";
import type { CoachRecord } from "@/lib/coaches-data";
import type { Room, Equipment } from "@/lib/rooms-data";
import type { LeagueTeam } from "@/lib/leagues-data";
import type { Tournament } from "@/lib/tournaments-data";
import type { ClubEvent } from "@/lib/events-data";
import type { AttendanceClass } from "@/lib/attendance-data";
import type { RelationDoc } from "@/lib/relations-data";
import type { SessionDoc } from "@/lib/sessions-data";
import { defaultRatingTiers } from "@/lib/rating-tiers-data";

/** Permanent (ongoing) vs round (fixed cohort/term). */
type Recurrence = "קבוע" | "סבב";
export type SeedCourse = Course & { recurrence: Recurrence };
export type SeedTournament = Tournament & { recurrence: Recurrence };

/** Build an `id → name` lookup from a list of `{ id, name }` seed records. */
function nameByIdOf<T extends { id: string; name: string }>(
  items: T[],
): Record<string, string> {
  return Object.fromEntries(items.map((i) => [i.id, i.name]));
}

/** Re-key seed records so the document id is the record's own name. */
function keyByName<T extends { name: string }>(items: T[]): T[] {
  return items.map((i) => ({ ...i, id: i.name }));
}

// ── Dates: every one of them is derived from TODAY ────────────────────────────
// NOTHING here may be a literal date. The app's conflict engines work on a
// rolling window (today → +12 months, see hooks/schedule/*), so a seed written
// with fixed dates silently rots: its meetings drift into the past and the
// built conflicts stop being reachable. Instead every fixture is expressed as
// "the Nth occurrence of a weekday, counted from the next one after today",
// which keeps the conflicts live and the timing states (הסתיימה / פעילה /
// מתוכננת) true whenever `npm run seed` happens to be run.
const TODAY = new Date();

const HEBREW_DAY_BY_JS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

/** "YYYY-MM-DD" for a Date, read in local time so the day never shifts. */
function isoOf(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** ISO date `offset` days from today (negative goes back). */
function daysFromToday(offset: number): string {
  const date = new Date(TODAY);
  date.setDate(TODAY.getDate() + offset);
  return isoOf(date);
}

/**
 * ISO date of one occurrence of a Hebrew weekday. `weekOffset` 0 is the first
 * occurrence STRICTLY after today, negative walks back a week at a time and
 * positive walks forward — so `("רביעי", -3)` is three Wednesdays ago and
 * `("רביעי", 2)` is two Wednesdays after the next one.
 */
function weekdayOccurrence(day: string, weekOffset: number): string {
  const target = HEBREW_DAY_BY_JS.indexOf(day);
  // `|| 7` keeps it strictly after today, so a fixture is never "today" — which
  // would sit ambiguously on the edge of the engines' window.
  const daysAhead = (target - TODAY.getDay() + 7) % 7 || 7;
  const date = new Date(TODAY);
  date.setDate(TODAY.getDate() + daysAhead + weekOffset * 7);
  return isoOf(date);
}

/** "2026-07-29" → "29.07.2026", the form the tables display. */
function displayDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

/**
 * The weekday the built conflicts all land on, and a second day used for the
 * deliberately clash-free control meeting. Both are relative, so the cluster
 * moves with the calendar.
 */
const CONFLICT_DAY = "רביעי";
const CONTROL_DAY = "שישי";

// ── Coaches (6) ──────────────────────────────────────────────────────────────
const rawSeedCoaches: CoachRecord[] = [
  { id: "coach-1", name: "אבי לוי", phone: "050-1000001", email: "avi.levi@example.com", notes: "" },
  { id: "coach-2", name: "מירב כהן", phone: "054-1000002", email: "meirav.cohen@example.com", notes: "" },
  { id: "coach-3", name: "יוסי בן עמי", phone: "052-1000003", email: "yossi.benami@example.com", notes: "" },
  { id: "coach-4", name: "דנה אביב", phone: "053-1000004", email: "dana.aviv@example.com", notes: "" },
  { id: "coach-5", name: "רון פרידמן", phone: "050-1000005", email: "ron.friedman@example.com", notes: "" },
  { id: "coach-6", name: "שירה גל", phone: "054-1000006", email: "shira.gal@example.com", notes: "" },
];
export const seedCoaches: CoachRecord[] = keyByName(rawSeedCoaches);

// ── Rooms (3) ────────────────────────────────────────────────────────────────
const rawSeedRooms: Room[] = [
  { id: "room-1", name: "אולם ראשי", capacity: 40 },
  { id: "room-2", name: "חדר אימונים", capacity: 16 },
  { id: "room-3", name: "חדר תחרויות", capacity: 32 },
];
const roomNameById = nameByIdOf(rawSeedRooms);
export const seedRooms: Room[] = keyByName(rawSeedRooms);

// ── Equipment (3) ────────────────────────────────────────────────────────────
const rawSeedEquipment: Equipment[] = [
  { id: "equipment-1", name: "שעוני שח", quantity: 30, notes: "5 דורשים סוללות" },
  { id: "equipment-2", name: "לוחות הדגמה", quantity: 8, notes: "—" },
  { id: "equipment-3", name: "סטים מגנטיים", quantity: 20, notes: "—" },
];
export const seedEquipment: Equipment[] = keyByName(rawSeedEquipment);

// ── Players (20, every age band) ─────────────────────────────────────────────
const basePlayers: PlayerBase[] = [
  { id: "player-1",  name: "אורי גולן",   age: 7,  grade: "כיתה ב",  israeliRating: 480,  fideRating: null, ratingUpdatedRecently: true,  phone: "050-2000001", courses: ["שחמט מתחילים"], tournaments: [], leagueTeam: null, status: "פעיל" },
  // No tournaments: אליפות הקיץ's CONFLICT_DAY round overlaps שחמט מתחילים, and a
  // player double-booking is blocking in the app. איתי רגב plays it instead.
  { id: "player-2",  name: "נועם כץ",      age: 9,  grade: "כיתה ד",  israeliRating: 720,  fideRating: null, ratingUpdatedRecently: true,  phone: "050-2000002", courses: ["שחמט מתחילים"], tournaments: [], leagueTeam: null, status: "פעיל" },
  { id: "player-3",  name: "מיה שפירא",    age: 11, grade: "כיתה ו",  israeliRating: 1050, fideRating: null, ratingUpdatedRecently: true,  phone: "050-2000003", courses: ["שחמט מתקדמים"], tournaments: [], leagueTeam: null, status: "פעיל" },
  { id: "player-4",  name: "דניאל ברק",    age: 13, grade: "כיתה ח",  israeliRating: 1340, fideRating: 1300, ratingUpdatedRecently: true,  phone: "050-2000004", courses: ["מועדון אחה״צ"], tournaments: [], leagueTeam: null, status: "פעיל" },
  { id: "player-5",  name: "יעל אבני",     age: 14, grade: "כיתה ט",  israeliRating: 1180, fideRating: null, ratingUpdatedRecently: false, phone: "050-2000005", courses: ["שחמט מתקדמים"], tournaments: [], leagueTeam: "נוער ב'", status: "פעיל" },
  { id: "player-6",  name: "איתי רגב",     age: 16, grade: "כיתה יא", israeliRating: 1620, fideRating: 1580, ratingUpdatedRecently: true,  phone: "050-2000006", courses: [], tournaments: ["אליפות הקיץ"], leagueTeam: "נוער ב'", status: "פעיל" },
  { id: "player-7",  name: "רוני שמש",     age: 17, grade: "כיתה יב", israeliRating: 1750, fideRating: 1700, ratingUpdatedRecently: true,  phone: "050-2000007", courses: [], tournaments: [], leagueTeam: "נבחרת הנוער", status: "ליגה בלבד" },
  { id: "player-8",  name: "גיא אורן",     age: 19, grade: "בוגר",   israeliRating: 1880, fideRating: 1850, ratingUpdatedRecently: true,  phone: "050-2000008", courses: ["סדנת פתיחות"], tournaments: [], leagueTeam: "נבחרת ב'", status: "פעיל" },
  { id: "player-9",  name: "תמר כהן",      age: 22, grade: "בוגר",   israeliRating: 2010, fideRating: 1980, ratingUpdatedRecently: true,  phone: "050-2000009", courses: [], tournaments: [], leagueTeam: "נבחרת הנשים", status: "ליגה בלבד" },
  { id: "player-10", name: "עידן פרץ",     age: 27, grade: "בוגר",   israeliRating: 2180, fideRating: 2150, ratingUpdatedRecently: false, phone: "050-2000010", courses: ["שחמט בוגרים"], tournaments: ["טורניר המאסטרים"], leagueTeam: "נבחרת ב'", status: "פעיל" },
  { id: "player-11", name: "נדב אורן",     age: 33, grade: "בוגר",   israeliRating: 2310, fideRating: 2290, ratingUpdatedRecently: true,  phone: "050-2000011", courses: [], tournaments: ["טורניר המאסטרים"], leagueTeam: "נבחרת המאסטרים", status: "ליגה בלבד" },
  { id: "player-12", name: "שירה גל",      age: 40, grade: "בוגר",   israeliRating: 1950, fideRating: 1920, ratingUpdatedRecently: true,  phone: "050-2000012", courses: ["סדנת פתיחות"], tournaments: [], leagueTeam: "נשים עילית", status: "פעיל" },
  { id: "player-13", name: "רון פרידמן",   age: 48, grade: "בוגר",   israeliRating: 2240, fideRating: 2210, ratingUpdatedRecently: false, phone: "050-2000013", courses: ["שחמט בוגרים"], tournaments: ["טורניר המאסטרים"], leagueTeam: "נבחרת המאסטרים", status: "ליגה בלבד" },
  { id: "player-14", name: "אבי שלום",     age: 55, grade: "בוגר",   israeliRating: 1700, fideRating: 1650, ratingUpdatedRecently: true,  phone: "050-2000014", courses: ["שחמט בוגרים"], tournaments: [], leagueTeam: null, status: "פעיל" },
  { id: "player-15", name: "דליה אביב",    age: 63, grade: "בוגר",   israeliRating: 1450, fideRating: null, ratingUpdatedRecently: false, phone: "050-2000015", courses: [], tournaments: [], leagueTeam: "נשים עילית", status: "לא פעיל" },
  { id: "player-16", name: "יוסף בן עמי",  age: 70, grade: "בוגר",   israeliRating: 1880, fideRating: 1820, ratingUpdatedRecently: true,  phone: "050-2000016", courses: ["שחמט בוגרים"], tournaments: [], leagueTeam: null, status: "פעיל" },
  { id: "player-17", name: "ליאת מור",     age: 12, grade: "כיתה ז",  israeliRating: 900,  fideRating: null, ratingUpdatedRecently: true,  phone: "050-2000017", courses: ["מועדון אחה״צ"], tournaments: [], leagueTeam: null, status: "פעיל" },
  { id: "player-18", name: "עומר טל",      age: 15, grade: "כיתה י",  israeliRating: 1500, fideRating: 1460, ratingUpdatedRecently: true,  phone: "050-2000018", courses: [], tournaments: [], leagueTeam: "נבחרת הנוער", status: "ליגה בלבד" },
  { id: "player-19", name: "נועה ברק",     age: 25, grade: "בוגר",   israeliRating: 2090, fideRating: 2050, ratingUpdatedRecently: true,  phone: "050-2000019", courses: [], tournaments: [], leagueTeam: "נבחרת הנשים", status: "ליגה בלבד" },
  { id: "player-20", name: "אלון זיו",     age: 36, grade: "בוגר",   israeliRating: 2150, fideRating: 2120, ratingUpdatedRecently: false, phone: "050-2000020", courses: ["שחמט בוגרים"], tournaments: ["טורניר המאסטרים"], leagueTeam: "נבחרת ב'", status: "פעיל" },
];

// Player documents are keyed by the player's full name (readable ids in
// Firestore). This map lets every player reference (league rosters, attendance
// students, relations) point at the same name-based id.
const playerNameById: Record<string, string> = Object.fromEntries(
  basePlayers.map((p) => [p.id, p.name]),
);

// Associations (courses / tournaments / league) are NOT stored on the player
// doc — they live in `relations` (built below). Strip them from the persisted
// record; the app projects them back in at read time.
// The associations (courses / tournaments / league) are deliberately omitted —
// they live in `relations`, not on the player doc. Only the roster columns and
// the invented personal details are persisted.
export const seedPlayers = basePlayers.map((player) => ({
  id: player.name,
  name: player.name,
  age: player.age,
  grade: player.grade,
  israeliRating: player.israeliRating,
  fideRating: player.fideRating,
  ratingUpdatedRecently: player.ratingUpdatedRecently,
  phone: player.phone,
  status: player.status,
  ...deriveDetails(player),
  // "Recently" means about a month ago; a stale rating about five months ago.
  ratingUpdatedAt: displayDate(
    daysFromToday(player.ratingUpdatedRecently ? -33 : -150),
  ),
}));

// ── League teams (2 per category: בוגרים / נוער / נשים) ───────────────────────
const rawSeedLeagues: LeagueTeam[] = [
  { id: "league-1", category: "בוגרים", rank: "לאומית", name: "נבחרת המאסטרים", notes: "אלופי העונה הקודמת",
    players: [{ id: "player-11", name: "נדב אורן", rating: 2310 }, { id: "player-13", name: "רון פרידמן", rating: 2240 }] },
  { id: "league-2", category: "בוגרים", rank: "ארצית", name: "נבחרת ב'", notes: "—",
    players: [{ id: "player-10", name: "עידן פרץ", rating: 2180 }, { id: "player-20", name: "אלון זיו", rating: 2150 }] },
  { id: "league-3", category: "נוער", rank: "ארצית", name: "נבחרת הנוער", notes: "—",
    players: [{ id: "player-7", name: "רוני שמש", rating: 1750 }, { id: "player-18", name: "עומר טל", rating: 1500 }] },
  { id: "league-4", category: "נוער", rank: "מחוזית", name: "נוער ב'", notes: "קבוצה צעירה",
    players: [{ id: "player-6", name: "איתי רגב", rating: 1620 }, { id: "player-5", name: "יעל אבני", rating: 1180 }] },
  { id: "league-5", category: "נשים", rank: "ארצית", name: "נבחרת הנשים", notes: "—",
    players: [{ id: "player-9", name: "תמר כהן", rating: 2010 }, { id: "player-19", name: "נועה ברק", rating: 2090 }] },
  { id: "league-6", category: "נשים", rank: "עילית", name: "נשים עילית", notes: "—",
    players: [{ id: "player-12", name: "שירה גל", rating: 1950 }, { id: "player-15", name: "דליה אביב", rating: 1450 }] },
];

// Point each roster entry at the player's name-based document id.
export const seedLeagues: LeagueTeam[] = rawSeedLeagues.map((team) => ({
  ...team,
  id: team.name,
  players: team.players.map((pl) => ({
    ...pl,
    id: playerNameById[pl.id] ?? pl.id,
  })),
}));

// ── Courses (6) — current/future × permanent/round ───────────────────────────
// Occupancy (ריק/חלקי/מלא) is derived from enrolled/capacity, so the rows omit
// it — and `days` / `times` / `nextDate` are derived from the seeded sessions
// further down, so a course's declared schedule can never drift from the
// meetings that actually drive conflict detection.
type RawCourse = Omit<SeedCourse, "occupancy" | "days" | "times" | "nextDate">;
const rawSeedCourses: RawCourse[] = [
  { id: "course-1", name: "שחמט מתחילים", coach: "אבי לוי",     ageMin: 6,  ageMax: 10, ratingMin: 0,    ratingMax: 800,  enrolled: 8,  capacity: 0,  status: "פעיל",   room: "אולם ראשי",   recurrence: "קבוע" }, // current, permanent → חלקי
  { id: "course-2", name: "שחמט מתקדמים", coach: "יוסי בן עמי", ageMin: 11, ageMax: 16, ratingMin: 800,  ratingMax: 1600, enrolled: 12, capacity: 12, status: "פעיל",   room: "אולם ראשי",   recurrence: "סבב" },  // current, round → מלא
  { id: "course-3", name: "מועדון אחה״צ", coach: "מירב כהן",    ageMin: 8,  ageMax: 14, ratingMin: 400,  ratingMax: 1200, enrolled: 9,  capacity: 16, status: "פעיל",   room: "חדר אימונים", recurrence: "קבוע" }, // current, permanent → חלקי
  { id: "course-4", name: "שחמט בוגרים",  coach: "רון פרידמן",  ageMin: 18, ageMax: 99, ratingMin: 1400, ratingMax: 2500, enrolled: 5,  capacity: 20, status: "מתוכנן", room: "חדר תחרויות", recurrence: "סבב" },  // future, round → חלקי
  { id: "course-5", name: "סדנת פתיחות",  coach: "שירה גל",     ageMin: 14, ageMax: 99, ratingMin: 1200, ratingMax: 2400, enrolled: 6,  capacity: 0,  status: "פעיל",   room: "אולם ראשי",   recurrence: "קבוע" }, // current, permanent → חלקי
  { id: "course-6", name: "חוג גן",       coach: "דנה אביב",    ageMin: 4,  ageMax: 7,  ratingMin: 0,    ratingMax: 400,  enrolled: 0,  capacity: 10, status: "מתוכנן", room: "חדר אימונים", recurrence: "סבב" },  // future, round → ריק
];

const courseNameById = nameByIdOf(rawSeedCourses);

// ── Tournaments (6) — same current/future × permanent/round spread ───────────
// Timing is spread across the three states, and since the round dates are all
// computed from today (see the sessions below) each state stays true forever:
//   • הסתיימה  — every round is in the past (tournament-4).
//   • פעילה    — rounds straddle today; started, still running
//                (tournament-1 round series, plus the two weekly leagues 3 & 5).
//   • מתוכננת  — every round is still ahead (tournament-2, tournament-6).
// `days` / `times` / `nextDate` are derived from those sessions, never written.
// `capacity: 0` means unlimited (tournaments 2 & 5), so both the capped and the
// uncapped rendering show up in the table.
type RawTournament = Omit<SeedTournament, "days" | "times" | "nextDate">;
const rawSeedTournaments: RawTournament[] = [
  { id: "tournament-1", name: "אליפות הקיץ",        judge: "אבי לוי",    status: "פעילה",   rounds: 7, participants: 32, capacity: 40, ratingMin: 1000, ratingMax: 2400, room: "חדר תחרויות", recurrence: "סבב" },  // ongoing, round
  { id: "tournament-2", name: "גביע הנוער",         judge: "דנה אביב",   status: "מתוכננת", rounds: 5, participants: 24, capacity: 0,  ratingMin: 800,  ratingMax: 1600, room: "אולם ראשי",   recurrence: "סבב" },  // not started, round
  { id: "tournament-3", name: "ליגת הבזק השבועית",  judge: "רון פרידמן", status: "פעילה",   rounds: 9, participants: 40, capacity: 40, ratingMin: 1000, ratingMax: 2200, room: "חדר תחרויות", recurrence: "קבוע" }, // ongoing, permanent (weekly)
  { id: "tournament-4", name: "אליפות האביב",       judge: "מירב כהן",   status: "הסתיימה", rounds: 6, participants: 28, capacity: 30, ratingMin: 600,  ratingMax: 1500, room: "אולם ראשי",   recurrence: "סבב" },  // finished, round
  { id: "tournament-5", name: "טורניר המאסטרים",    judge: "נדב אורן",   status: "פעילה",   rounds: 8, participants: 16, capacity: 0,  ratingMin: 1800, ratingMax: 2800, room: "אולם ראשי",   recurrence: "קבוע" }, // ongoing, permanent (weekly)
  { id: "tournament-6", name: "גביע סוף העונה",     judge: "שירה גל",    status: "מתוכננת", rounds: 9, participants: 48, capacity: 60, ratingMin: 1200, ratingMax: 2600, room: "אולם ראשי",   recurrence: "סבב" },  // not started, round
];

const tournamentNameById = nameByIdOf(rawSeedTournaments);

// ── Events (1 one-off, still ahead) ─────────────────────────────────────────
// A one-off opening evening: a single session (see the sessions below), from
// which its activity day and `nextDate` are derived.
type RawEvent = Omit<ClubEvent, "days" | "nextDate">;
const rawSeedEvents: RawEvent[] = [
  { id: "event-1", name: "ערב פתיחת מועדון קיץ", status: "מתוכנן", recurrence: "חד פעמי", room: "אולם ראשי", notes: "" },
];
const eventNameById = nameByIdOf(rawSeedEvents);

// ── Attendance (2 classes, left unmarked — to be filled in the app) ──────────
// Both classes mirror the two CONFLICT_DAY courses, so their meeting dates are
// the same upcoming weekdays those courses meet on — never literal dates.
const rawSeedAttendance: AttendanceClass[] = [
  {
    id: "attendance-1", name: "שחמט מתחילים", coach: "אבי לוי",
    sessions: [
      { id: "attsession-1", date: displayDate(weekdayOccurrence(CONFLICT_DAY, 0)), label: "מפגש 1" },
      { id: "attsession-2", date: displayDate(weekdayOccurrence(CONFLICT_DAY, 1)), label: "מפגש 2" },
    ],
    students: [
      { id: "player-1", name: "אורי גולן", rating: 480 },
      { id: "player-2", name: "נועם כץ", rating: 720 },
    ],
  },
  {
    id: "attendance-2", name: "שחמט מתקדמים", coach: "יוסי בן עמי",
    sessions: [{ id: "attsession-3", date: displayDate(weekdayOccurrence(CONFLICT_DAY, 0)), label: "מפגש 1" }],
    students: [
      { id: "player-3", name: "מיה שפירא", rating: 1050 },
      { id: "player-5", name: "יעל אבני", rating: 1180 },
    ],
  },
];

// Point each attendance student at the player's name-based document id.
export const seedAttendance: AttendanceClass[] = rawSeedAttendance.map((cls) => ({
  ...cls,
  id: cls.name,
  students: cls.students.map((s) => ({
    ...s,
    id: playerNameById[s.id] ?? s.id,
  })),
}));

// ── Sessions (scheduling slots — the conflict source of truth) ───────────────
// Times "HH:mm". A round-based tournament gets one concrete session per round
// (a dated one-off); a permanent one gets a single open-ended weekly recurrence.
type RawSession = Omit<SessionDoc, "id">;

/**
 * A weekly series of `count` dated one-off rounds on `day`, the first landing on
 * `fromWeek` (see {@link weekdayOccurrence}: 0 = the next such weekday, negative
 * = already past). This is how a tournament's timing state is expressed —
 * finished series sit entirely in the past, ongoing ones straddle today.
 */
function roundSeries(
  parentId: string,
  day: string,
  fromWeek: number,
  count: number,
  time: { start: string; end: string },
  roomId: string,
): RawSession[] {
  return Array.from({ length: count }, (_, i) => ({
    parentType: "tournament" as const,
    parentId,
    date: weekdayOccurrence(day, fromWeek + i),
    start: time.start,
    end: time.end,
    roomId,
  }));
}

// Course meetings. A course session is always an open-ended weekly recurrence
// (see the mapping below), so `date` fixes the weekday AND when the series
// started — never when it ends. That start matters: the app derives an
// activity's status from its sessions (lib/activity-timing.ts), and a course
// counts as פעיל only once its first occurrence is behind us. So a RUNNING
// course is anchored in the past (`STARTED_WEEKS_AGO`) while a planned one is
// anchored ahead; either way it recurs on the same weekday forever, which is
// what keeps the built conflicts reachable. See the block at the bottom.
const STARTED_WEEKS_AGO = -4;
const fixtureSessions: RawSession[] = [
  // פעיל, and the three that the room / coach / equipment conflicts hang off.
  { parentType: "course",     parentId: "course-1",     date: weekdayOccurrence(CONFLICT_DAY, STARTED_WEEKS_AGO), start: "16:00", end: "17:30", roomId: "room-1" },
  { parentType: "course",     parentId: "course-2",     date: weekdayOccurrence(CONFLICT_DAY, STARTED_WEEKS_AGO), start: "17:00", end: "18:30", roomId: "room-1" },
  { parentType: "course",     parentId: "course-3",     date: weekdayOccurrence(CONFLICT_DAY, STARTED_WEEKS_AGO), start: "16:30", end: "18:00", roomId: "room-2" },
  { parentType: "course",     parentId: "course-1",     date: weekdayOccurrence(CONTROL_DAY,  STARTED_WEEKS_AGO), start: "16:00", end: "17:30", roomId: "room-1" }, // control, no conflict
  { parentType: "course",     parentId: "course-5",     date: weekdayOccurrence("חמישי",      STARTED_WEEKS_AGO), start: "17:00", end: "18:30", roomId: "room-1" },
  // מתוכנן — first meeting still ahead. Both sit on days/rooms deliberately
  // clear of every other fixture, so they add no unintended clashes.
  { parentType: "course",     parentId: "course-4",     date: weekdayOccurrence("שלישי", 2),      start: "16:00", end: "17:30", roomId: "room-3" },
  { parentType: "course",     parentId: "course-6",     date: weekdayOccurrence(CONFLICT_DAY, 3), start: "14:00", end: "15:00", roomId: "room-2" },
  // event-1 is a one-off opening evening: a SINGLE session, still ahead.
  { parentType: "event",      parentId: "event-1",      date: weekdayOccurrence("ראשון", 0),      start: "18:00", end: "20:00", roomId: "room-1" }, // אולם ראשי
];

// Tournament schedule, spread across the three timing states around today.
const tournamentSessions: RawSession[] = [
  // הסתיימה — אליפות האביב: 6 Sunday rounds, every one already past.
  ...roundSeries("tournament-4", "ראשון", -7, 6, { start: "16:00", end: "19:00" }, "room-1"),
  // פעילה (rounds) — אליפות הקיץ: 7 weekly rounds straddling today, so it reads
  // as in-progress. Week 0 lands on CONFLICT_DAY, which is what drives the COACH
  // conflict (אבי לוי runs course-1 16:00–17:30 while judging here 17:00–20:00)
  // and the EQUIPMENT one (its 16 clocks joining the two courses' 14 + 12).
  ...roundSeries("tournament-1", CONFLICT_DAY, -3, 7, { start: "17:00", end: "20:00" }, "room-3"),
  // מתוכננת — גביע הנוער: 5 Monday rounds, all ahead.
  ...roundSeries("tournament-2", "שני", 1, 5, { start: "17:00", end: "20:00" }, "room-1"),
  // מתוכננת — גביע סוף העונה: Sunday + Wednesday rounds, all ahead.
  ...roundSeries("tournament-6", "ראשון", 2, 5, { start: "16:00", end: "19:00" }, "room-1"),
  ...roundSeries("tournament-6", CONFLICT_DAY, 2, 4, { start: "16:00", end: "19:00" }, "room-1"),
  // פעילה (permanent, weekly) — a single open-ended weekly recurrence each, so
  // they stay ongoing forever. Their start date is in the past on purpose.
  { parentType: "tournament", parentId: "tournament-3", date: weekdayOccurrence("חמישי", -7), start: "18:00", end: "21:00", roomId: "room-3", frequency: "weekly", noEndDate: true, endDate: "", day: "חמישי" },
  { parentType: "tournament", parentId: "tournament-5", date: weekdayOccurrence("שלישי", -5), start: "18:30", end: "21:00", roomId: "room-1", frequency: "weekly", noEndDate: true, endDate: "", day: "שלישי" },
];

const rawSeedSessions: RawSession[] = [...fixtureSessions, ...tournamentSessions];

// Name lookups per parent type, so session parents/rooms point at name ids.
const parentNameById: Record<SessionDoc["parentType"], Record<string, string>> = {
  course: courseNameById,
  tournament: tournamentNameById,
  event: eventNameById,
};

// Session ids follow the SAME deterministic scheme the app uses when it writes
// them (lib/firebase/data/sessions.ts): every session — course, tournament or
// event — is `${parentName}__meeting__${index}`, the index counting per parent.
// Seeding with these exact ids means editing an activity in the app REPLACES its
// seeded sessions in place (idempotent) instead of leaving orphans — and it keeps
// naming uniform with app-created sessions, never the old ad-hoc `session-N`.
const seedSessionCount: Record<string, number> = {};

export const seedSessions: SessionDoc[] = rawSeedSessions.map((s) => {
  const parentId = parentNameById[s.parentType][s.parentId] ?? s.parentId;
  const index = seedSessionCount[parentId] ?? 0;
  seedSessionCount[parentId] = index + 1;
  // A session is recurring when it carries an explicit frequency, or it's a
  // course meeting (courses default to an open-ended weekly recurrence). A
  // dated one-off (e.g. a tournament round) keeps just its concrete date.
  // Tagging the weekday + repeat rule keeps the edit forms coherent without
  // disturbing the concrete dates that drive the conflict fixtures.
  const recurring = s.frequency != null || s.parentType === "course";
  return {
    ...s,
    id: `${parentId}__meeting__${index}`.replace(/\//g, "／"),
    parentId,
    roomId: roomNameById[s.roomId] ?? s.roomId,
    ...(recurring
      ? {
          day: s.day ?? HEBREW_DAY_BY_JS[new Date(s.date).getDay()],
          frequency: s.frequency ?? ("weekly" as const),
          noEndDate: s.noEndDate ?? true,
          endDate: s.endDate ?? "",
        }
      : {}),
  };
});

// ── Schedule projected back onto the activities ──────────────────────────────
// `days`, `times` and `nextDate` are READ OFF the sessions above rather than
// typed by hand, so an activity's advertised schedule is always exactly the
// meetings that conflict detection runs on — and, since those meetings are
// relative to today, none of it can go stale.
const RANGE_START = isoOf(TODAY);
const RANGE_END = daysFromToday(365);

/** Every weekday an activity meets on, ordered as the week runs. */
function daysOf(parentId: string): CourseDay[] {
  const days = new Set<string>();
  for (const session of seedSessions) {
    if (session.parentId !== parentId) continue;
    days.add(session.day ?? HEBREW_DAY_BY_JS[new Date(session.date).getDay()]);
  }
  return HEBREW_DAY_BY_JS.filter((day) => days.has(day)) as CourseDay[];
}

/** The meeting window on each weekday the activity runs. */
function timesOf(parentId: string): WeeklyTimes {
  const times: WeeklyTimes = {};
  for (const session of seedSessions) {
    if (session.parentId !== parentId) continue;
    const day = (session.day ??
      HEBREW_DAY_BY_JS[new Date(session.date).getDay()]) as CourseDay;
    times[day] ??= { start: session.start, end: session.end };
  }
  return times;
}

/** The next meeting from today on, or "—" once every one of them is past. */
function nextDateOf(parentId: string): string {
  const upcoming = seedSessions
    .filter((session) => session.parentId === parentId)
    .flatMap((session) => occurrencesInRange(session, RANGE_START, RANGE_END))
    .sort();
  return upcoming.length > 0 ? displayDate(upcoming[0]) : "—";
}

export const seedCourses: SeedCourse[] = rawSeedCourses.map((course) => ({
  ...course,
  id: course.name,
  occupancy: courseOccupancy(course.enrolled, course.capacity),
  days: daysOf(course.name),
  times: timesOf(course.name),
  nextDate: nextDateOf(course.name),
  notes: "",
}));

export const seedTournaments: SeedTournament[] = rawSeedTournaments.map((t) => ({
  ...t,
  id: t.name,
  days: daysOf(t.name),
  times: timesOf(t.name),
  nextDate: nextDateOf(t.name),
  notes: "",
}));

export const seedEvents: ClubEvent[] = rawSeedEvents.map((event) => ({
  ...event,
  id: event.name,
  days: daysOf(event.name),
  nextDate: nextDateOf(event.name),
}));

// ── Rating tiers (dashboard config — label + rating range, counts are derived) ─
export const seedRatingTiers = defaultRatingTiers;

// ── Rosters (saved player lists) ─────────────────────────────────────────────
// Three starter lists, keyed by name like every other doc. Their members are
// picked here by a rating / age rule purely to fill them with something sensible
// — once seeded they are ordinary editable lists, and membership lives in
// `relations` (built below), not on the roster doc.
const rosterSeedRules: { name: string; matches: (p: PlayerBase) => boolean }[] = [
  { name: "מד כושר עד 800", matches: (p) => p.israeliRating <= 800 },
  { name: "מד כושר מעל 1800", matches: (p) => p.israeliRating > 1800 },
  { name: "גיל עד 18", matches: (p) => p.age <= 18 },
];

export const seedRosters = rosterSeedRules.map(({ name }) => ({
  id: name,
  name,
}));

// ── Relations (junction — the single source of truth for who is linked to what)
// Built by name (docs are keyed by name), so no id→name mapping is needed here.
// Deterministic ids match the app's scheme in lib/firebase/data/relations.ts,
// so a relation seeded here can be removed from the UI (and vice-versa).
function rel(
  kind: RelationDoc["kind"],
  subjectType: RelationDoc["subjectType"],
  subjectId: string,
  targetType: RelationDoc["targetType"],
  targetId: string,
  extra?: { role?: string; status?: string; quantity?: number },
): RelationDoc {
  return {
    id: `${subjectId}__${kind}__${targetId}`.replace(/\//g, "／"),
    kind,
    subjectType,
    subjectId,
    targetType,
    targetId,
    ...extra,
  };
}

// player ↔ course / tournament / league — derived from the roster associations.
const playerRelations: RelationDoc[] = basePlayers.flatMap((p) => {
  const out: RelationDoc[] = [];
  for (const course of p.courses)
    out.push(rel("player_course", "player", p.name, "course", course));
  for (const t of p.tournaments)
    out.push(rel("player_tournament", "player", p.name, "tournament", t));
  if (p.leagueTeam)
    out.push(rel("player_league", "player", p.name, "league", p.leagueTeam));
  return out;
});

// player ↔ roster — the starter lists' members, from the rules above.
const rosterRelations: RelationDoc[] = rosterSeedRules.flatMap((list) =>
  basePlayers
    .filter(list.matches)
    .map((p) => rel("player_roster", "player", p.name, "roster", list.name)),
);

// coach ↔ course — each course names its instructing coach.
const coachCourseRelations: RelationDoc[] = rawSeedCourses.map((c) =>
  rel("coach_course", "coach", c.coach, "course", c.name, { role: "מדריך ראשי" }),
);

// NOTE: room is NOT modelled as a relation — it lives per-session on
// `sessions.roomId`, so each session can use a different room. See the seeded
// sessions below.

// Curated extras that don't fall out of the roster: the intentional (warning)
// conflicts — see the block below — plus the equipment↔course links.
const curatedRelations: RelationDoc[] = [
  // NOTE: there is deliberately NO player double-booking here. A player clash is
  // BLOCKING in the app (a busy child cannot be enroled — see lib/conflicts.ts
  // `busyPlayers`), so seeding one would seed invalid data. Room / coach /
  // equipment clashes stay, since those are surfaced as warnings.
  // COACH conflict — אבי לוי judges אליפות הקיץ while running שחמט מתחילים.
  rel("coach_tournament", "coach", "אבי לוי", "tournament", "אליפות הקיץ", { role: "שופט" }),
  // EQUIPMENT conflict — שעוני שח used by two overlapping courses.
  rel("equipment_course", "equipment", "שעוני שח", "course", "שחמט מתחילים", { quantity: 14 }),
  rel("equipment_course", "equipment", "שעוני שח", "course", "שחמט מתקדמים", { quantity: 12 }),
  rel("equipment_course", "equipment", "לוחות הדגמה", "course", "מועדון אחה״צ", { quantity: 2 }),
  // equipment ↔ tournament — gear allocated to competitions.
  rel("equipment_tournament", "equipment", "שעוני שח", "tournament", "אליפות הקיץ", { quantity: 16 }),
  rel("equipment_tournament", "equipment", "לוחות הדגמה", "tournament", "טורניר המאסטרים", { quantity: 4 }),
  // equipment ↔ event — gear allocated to one-off events.
  rel("equipment_event", "equipment", "סטים מגנטיים", "event", "ערב פתיחת מועדון קיץ", { quantity: 10 }),
];

// Dedupe by document id (a derived link may coincide with a curated one).
export const seedRelations: RelationDoc[] = Array.from(
  new Map(
    [
      ...playerRelations,
      ...rosterRelations,
      ...coachCourseRelations,
      ...curatedRelations,
    ].map(
      (r) => [r.id, r],
    ),
  ).values(),
);

/*
 * BUILT CONFLICTS. They all land on the next CONFLICT_DAY (a Wednesday) and
 * recur weekly from there, so they are reachable from the app's rolling window
 * whenever the seed is run — there is no fixed date to go stale. Referenced by
 * parent, since session ids are derived per parent:
 *
 *  1. ROOM      — course-1 & course-2 both in אולם ראשי, 16:00–17:30 vs 17:00–18:30 → overlap 17:00–17:30.
 *  2. COACH     — אבי לוי runs course-1 (16:00–17:30) and judges tournament-1 (17:00–20:00) → overlap 17:00–17:30.
 *  3. EQUIPMENT — שעוני שח: course-1 (14) + course-2 (12) + tournament-1 (16) = 42 of 30 during that
 *                 same 17:00–17:30 window. Note NO PAIR of them breaks 30 (14+12=26, 14+16=30) — it
 *                 takes all three at once, which is why detection sweeps for the peak instant rather
 *                 than comparing activities pairwise.
 *
 * All three are WARNINGS. There is intentionally no PLAYER conflict: that one
 * blocks enrolment outright, so no player is enroled in two activities that
 * overlap (see the note by `curatedRelations`).
 */
