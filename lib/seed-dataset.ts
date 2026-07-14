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
import { courseOccupancy, type Course, type WeeklyTimes } from "@/lib/courses-data";
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
  { id: "room-1", name: "אולם ראשי", capacity: 40, equipment: ["שעוני שח", "לוחות הדגמה"] },
  { id: "room-2", name: "חדר אימונים", capacity: 16, equipment: ["סטים מגנטיים"] },
  { id: "room-3", name: "חדר תחרויות", capacity: 32, equipment: ["שעוני שח", "לוחות תחרות"] },
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
  { id: "player-2",  name: "נועם כץ",      age: 9,  grade: "כיתה ד",  israeliRating: 720,  fideRating: null, ratingUpdatedRecently: true,  phone: "050-2000002", courses: ["שחמט מתחילים"], tournaments: ["אליפות הקיץ"], leagueTeam: null, status: "פעיל" },
  { id: "player-3",  name: "מיה שפירא",    age: 11, grade: "כיתה ו",  israeliRating: 1050, fideRating: null, ratingUpdatedRecently: true,  phone: "050-2000003", courses: ["שחמט מתקדמים"], tournaments: [], leagueTeam: null, status: "פעיל" },
  { id: "player-4",  name: "דניאל ברק",    age: 13, grade: "כיתה ח",  israeliRating: 1340, fideRating: 1300, ratingUpdatedRecently: true,  phone: "050-2000004", courses: ["מועדון אחה״צ"], tournaments: [], leagueTeam: null, status: "פעיל" },
  { id: "player-5",  name: "יעל אבני",     age: 14, grade: "כיתה ט",  israeliRating: 1180, fideRating: null, ratingUpdatedRecently: false, phone: "050-2000005", courses: ["שחמט מתקדמים"], tournaments: [], leagueTeam: "נוער ב'", status: "פעיל" },
  { id: "player-6",  name: "איתי רגב",     age: 16, grade: "כיתה יא", israeliRating: 1620, fideRating: 1580, ratingUpdatedRecently: true,  phone: "050-2000006", courses: [], tournaments: [], leagueTeam: "נוער ב'", status: "פעיל" },
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
  ratingUpdatedAt: player.ratingUpdatedRecently ? "20.06.2026" : "02.03.2026",
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

// ── Courses (6) — current/future × permanent/round. Today is 2026-06-30. ──────
// Occupancy (ריק/חלקי/מלא) is derived from enrolled/capacity, so the rows omit it.
const rawSeedCourses: Omit<SeedCourse, "occupancy">[] = [
  { id: "course-1", name: "שחמט מתחילים", coach: "אבי לוי",     ageMin: 6,  ageMax: 10, ratingMin: 0,    ratingMax: 800,  enrolled: 8,  capacity: 14, days: ["ראשון", "שלישי"], nextDate: "01.07.2026", status: "פעיל",   room: "אולם ראשי",   recurrence: "קבוע" }, // current, permanent → חלקי
  { id: "course-2", name: "שחמט מתקדמים", coach: "יוסי בן עמי", ageMin: 11, ageMax: 16, ratingMin: 800,  ratingMax: 1600, enrolled: 12, capacity: 12, days: ["שני", "רביעי"],   nextDate: "01.07.2026", status: "פעיל",   room: "חדר אימונים", recurrence: "סבב" },  // current, round → מלא
  { id: "course-3", name: "מועדון אחה״צ", coach: "מירב כהן",    ageMin: 8,  ageMax: 14, ratingMin: 400,  ratingMax: 1200, enrolled: 9,  capacity: 16, days: ["ראשון"],          nextDate: "01.07.2026", status: "פעיל",   room: "חדר אימונים", recurrence: "קבוע" }, // current, permanent → חלקי
  { id: "course-4", name: "שחמט בוגרים",  coach: "רון פרידמן",  ageMin: 18, ageMax: 99, ratingMin: 1400, ratingMax: 2500, enrolled: 5,  capacity: 20, days: ["שלישי"],          nextDate: "14.07.2026", status: "לא פעיל", room: "חדר תחרויות", recurrence: "סבב" },  // future, round → חלקי
  { id: "course-5", name: "סדנת פתיחות",  coach: "שירה גל",     ageMin: 14, ageMax: 99, ratingMin: 1200, ratingMax: 2400, enrolled: 6,  capacity: 12, days: ["חמישי"],          nextDate: "03.07.2026", status: "פעיל",   room: "אולם ראשי",   recurrence: "קבוע" }, // current, permanent → חלקי
  { id: "course-6", name: "חוג גן",       coach: "דנה אביב",    ageMin: 4,  ageMax: 7,  ratingMin: 0,    ratingMax: 400,  enrolled: 0,  capacity: 10, days: ["רביעי"],          nextDate: "22.07.2026", status: "לא פעיל", room: "חדר אימונים", recurrence: "סבב" },  // future, round → ריק
];

// Meeting time per weekday for each course (the "today" tables show the slot
// matching the current weekday).
const courseTimes: Record<string, WeeklyTimes> = {
  "course-1": { "ראשון": { start: "16:00", end: "17:30" }, "שלישי": { start: "17:00", end: "18:30" } },
  "course-2": { "שני": { start: "16:30", end: "18:00" }, "רביעי": { start: "16:30", end: "18:00" } },
  "course-3": { "ראשון": { start: "15:00", end: "16:30" } },
  "course-4": { "שלישי": { start: "18:00", end: "19:30" } },
  "course-5": { "חמישי": { start: "17:00", end: "18:30" } },
  "course-6": { "רביעי": { start: "16:00", end: "17:00" } },
};

const courseNameById = nameByIdOf(rawSeedCourses as { id: string; name: string }[]);
export const seedCourses: SeedCourse[] = rawSeedCourses.map((c) => ({
  ...c,
  id: c.name,
  occupancy: courseOccupancy(c.enrolled, c.capacity),
  times: courseTimes[c.id],
  notes: "",
}));

// ── Tournaments (6) — same current/future × permanent/round spread. ──────────
const rawSeedTournaments: SeedTournament[] = [
  { id: "tournament-1", name: "אליפות הקיץ",        judge: "אבי לוי",    status: "פעילה",   rounds: 7,  days: ["שלישי"],          nextDate: "01.07.2026", participants: 32, ratingMin: 1000, ratingMax: 2400, room: "חדר תחרויות", recurrence: "סבב" },  // current, round
  { id: "tournament-2", name: "גביע הנוער",         judge: "דנה אביב",   status: "מתוכננת", rounds: 5,  days: ["שני"],            nextDate: "13.07.2026", participants: 24, ratingMin: 800,  ratingMax: 1600, room: "אולם ראשי",   recurrence: "סבב" },  // future, round
  { id: "tournament-3", name: "ליגת הבזק השבועית",  judge: "רון פרידמן", status: "פעילה",   rounds: 9,  days: ["חמישי"],          nextDate: "03.07.2026", participants: 40, ratingMin: 1000, ratingMax: 2200, room: "חדר תחרויות", recurrence: "קבוע" }, // current, permanent (weekly)
  { id: "tournament-4", name: "אליפות האביב",       judge: "מירב כהן",   status: "הסתיימה", rounds: 6,  days: ["ראשון"],          nextDate: "—",          participants: 28, ratingMin: 600,  ratingMax: 1500, room: "אולם ראשי",   recurrence: "סבב" },  // past, round
  { id: "tournament-5", name: "טורניר המאסטרים",    judge: "נדב אורן",   status: "פעילה",   rounds: 8,  days: ["שלישי"],          nextDate: "01.07.2026", participants: 16, ratingMin: 1800, ratingMax: 2800, room: "חדר תחרויות", recurrence: "קבוע" }, // current, permanent
  { id: "tournament-6", name: "גביע סוף העונה",     judge: "שירה גל",    status: "מתוכננת", rounds: 9,  days: ["ראשון", "רביעי"], nextDate: "20.07.2026", participants: 48, ratingMin: 1200, ratingMax: 2600, room: "אולם ראשי",   recurrence: "סבב" },  // future, round
];

const tournamentTimes: Record<string, WeeklyTimes> = {
  "tournament-1": { "שלישי": { start: "17:00", end: "20:00" } },
  "tournament-2": { "שני": { start: "17:00", end: "20:00" } },
  "tournament-3": { "חמישי": { start: "18:00", end: "21:00" } },
  "tournament-4": { "ראשון": { start: "16:00", end: "19:00" } },
  "tournament-5": { "שלישי": { start: "18:30", end: "21:00" } },
  "tournament-6": { "ראשון": { start: "16:00", end: "19:00" }, "רביעי": { start: "16:00", end: "19:00" } },
};

const tournamentNameById = nameByIdOf(rawSeedTournaments);
export const seedTournaments: SeedTournament[] = rawSeedTournaments.map((t) => ({
  ...t,
  id: t.name,
  times: tournamentTimes[t.id],
  notes: "",
}));

// ── Events (1 one-off, next week) ────────────────────────────────────────────
// Meets weekly on TWO weekdays, each in a DIFFERENT room — demonstrating that
// room is per-session (see sessions below), not a single activity-level value.
const rawSeedEvents: ClubEvent[] = [
  { id: "event-1", name: "ערב פתיחת מועדון קיץ", days: ["ראשון", "שני"], nextDate: "05.07.2026", status: "מתוכנן", recurrence: "קבוע", room: "אולם ראשי", notes: "" },
];
const eventNameById = nameByIdOf(rawSeedEvents);
export const seedEvents: ClubEvent[] = keyByName(rawSeedEvents);

// ── Attendance (2 classes, left unmarked — to be filled in the app) ──────────
const rawSeedAttendance: AttendanceClass[] = [
  {
    id: "attendance-1", name: "שחמט מתחילים", coach: "אבי לוי",
    sessions: [
      { id: "attsession-1", date: "01.07.2026", label: "מפגש 1" },
      { id: "attsession-2", date: "08.07.2026", label: "מפגש 2" },
    ],
    students: [
      { id: "player-1", name: "אורי גולן", rating: 480 },
      { id: "player-2", name: "נועם כץ", rating: 720 },
    ],
  },
  {
    id: "attendance-2", name: "שחמט מתקדמים", coach: "יוסי בן עמי",
    sessions: [{ id: "attsession-3", date: "01.07.2026", label: "מפגש 1" }],
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
// All on 2026-07-01 except the no-conflict controls. Times "HH:mm".
const rawSeedSessions: SessionDoc[] = [
  { id: "session-1", parentType: "course",     parentId: "course-1",     date: "2026-07-01", start: "16:00", end: "17:30", roomId: "room-1" },
  { id: "session-2", parentType: "course",     parentId: "course-2",     date: "2026-07-01", start: "17:00", end: "18:30", roomId: "room-1" },
  { id: "session-3", parentType: "course",     parentId: "course-3",     date: "2026-07-01", start: "16:30", end: "18:00", roomId: "room-2" },
  { id: "session-4", parentType: "tournament", parentId: "tournament-1", date: "2026-07-01", start: "17:00", end: "18:00", roomId: "room-3" },
  { id: "session-5", parentType: "course",     parentId: "course-1",     date: "2026-07-03", start: "16:00", end: "17:30", roomId: "room-1" }, // control, no conflict
  // event-1 meets every Sunday in room-2 and every Monday in room-1 — two
  // sessions, two rooms, one activity (this is why room is per-session).
  { id: "session-6", parentType: "event",      parentId: "event-1",      date: "2026-07-05", start: "18:00", end: "20:00", roomId: "room-2" }, // Sunday, room-2
  { id: "session-7", parentType: "event",      parentId: "event-1",      date: "2026-07-06", start: "18:00", end: "20:00", roomId: "room-1" }, // Monday,  room-1
];

// Name lookups per parent type, so session parents/rooms point at name ids.
const parentNameById: Record<SessionDoc["parentType"], Record<string, string>> = {
  course: courseNameById,
  tournament: tournamentNameById,
  event: eventNameById,
};

const HEBREW_DAY_BY_JS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export const seedSessions: SessionDoc[] = rawSeedSessions.map((s) => ({
  ...s,
  parentId: parentNameById[s.parentType][s.parentId] ?? s.parentId,
  roomId: roomNameById[s.roomId] ?? s.roomId,
  // Course slots are recurring weekly meetings; tagging the weekday (derived
  // from the fixture date) + repeat rule keeps the "פרטי חוג" edit form coherent
  // without disturbing the concrete dates that drive the conflict fixtures.
  ...(s.parentType === "course"
    ? {
        day: HEBREW_DAY_BY_JS[new Date(s.date).getDay()],
        frequency: "weekly" as const,
        noEndDate: true,
        endDate: "",
      }
    : {}),
}));

// ── Rating tiers (dashboard config — label + rating range, counts are derived) ─
export const seedRatingTiers = defaultRatingTiers;

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

// coach ↔ course — each course names its instructing coach.
const coachCourseRelations: RelationDoc[] = rawSeedCourses.map((c) =>
  rel("coach_course", "coach", c.coach, "course", c.name, { role: "מדריך ראשי" }),
);

// NOTE: room is NOT modelled as a relation — it lives per-session on
// `sessions.roomId`, so each session can use a different room. See the seeded
// sessions below.

// Curated extras that don't fall out of the roster: the intentional conflicts
// (see the block below) plus the equipment↔course links.
const curatedRelations: RelationDoc[] = [
  // STUDENT conflict — אורי גולן is also in course-3, overlapping course-1.
  rel("player_course", "player", "אורי גולן", "course", "מועדון אחה״צ"),
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
    [...playerRelations, ...coachCourseRelations, ...curatedRelations].map(
      (r) => [r.id, r],
    ),
  ).values(),
);

/*
 * BUILT CONFLICTS (all on 2026-07-01):
 *  1. ROOM      — session-1 (course-1) & session-2 (course-2) both in room-1, 16:00–17:30 vs 17:00–18:30 → overlap 17:00–17:30.
 *  2. STUDENT   — player-1 is in course-1 (session-1, 16:00–17:30) and course-3 (session-3, 16:30–18:00) → overlap 16:30–17:30.
 *  3. EQUIPMENT — equipment-1 (שעוני שח) used by course-1 (session-1) and course-2 (session-2), which overlap → double-booked.
 *  4. COACH     — coach-1 runs course-1 (session-1, 16:00–17:30) and judges tournament-1 (session-4, 17:00–18:00) → overlap 17:00–17:30.
 */
