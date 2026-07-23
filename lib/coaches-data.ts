export type CoachStatus = "פעיל" | "מחליף" | "לא פעיל";

/**
 * A coach document as PERSISTED in Firestore. Associations (which courses a
 * coach instructs, which tournaments they judge) are NOT stored here — they
 * live in the `relations` junction collection and are projected in at read time.
 */
export interface CoachRecord {
  id: string;
  name: string;
  phone: string;
  /** Contact email, persisted in Firestore. */
  email?: string;
  /** Free-text notes, persisted in Firestore. */
  notes?: string;
  /**
   * Marks an inactive coach as a stand-in ("מחליף"). Persisted, so the choice
   * survives a reload; ignored while the coach is active.
   */
  substitute?: boolean;
}

/** Course/tournament associations projected onto a coach from `relations`. */
export interface CoachAssociations {
  /** Names of the חוגים the coach instructs. */
  courses: string[];
  /** Names of the תחרויות the coach is assigned to. */
  tournaments: string[];
  /** Count of tournaments — kept for the table pill / sort. */
  competitions: number;
}

/** The in-memory coach view: persisted record + projected associations + status. */
export interface Coach extends CoachRecord, CoachAssociations {
  status: CoachStatus;
}

/**
 * A coach is active while responsible for at least one חוג or תחרות. Reads the
 * projected associations, not any stored field.
 */
export function isCoachActive(c: {
  courses: string[];
  competitions: number;
}): boolean {
  return c.competitions > 0 || c.courses.length > 0;
}

/** The shape of the static sample coaches (still used by not-yet-migrated modules). */
interface CoachSeed {
  id: string;
  name: string;
  phone: string;
  courses: string[];
  competitions: number;
}

const coachSeeds: CoachSeed[] = [
  { id: "coach-1", name: "אבי לוי", phone: "050-1000001", courses: ["שחמט מתחילים"], competitions: 3 },
  { id: "coach-2", name: "מירב כהן", phone: "054-1000002", courses: ["שחמט מתחילים", "מועדון אחה״צ", "אימון קבוצתי", "שחמט מתקדמים", "סדנת פתיחות"], competitions: 5 },
  { id: "coach-3", name: "יוסי בן עמי", phone: "052-1000003", courses: ["שחמט מתקדמים"], competitions: 2 },
  { id: "coach-4", name: "דנה אביב", phone: "053-1000004", courses: [], competitions: 0 },
  { id: "coach-5", name: "רון פרידמן", phone: "050-1000005", courses: ["שחמט מתקדמים", "אימון קבוצתי"], competitions: 4 },
  { id: "coach-6", name: "תמר אלון", phone: "054-1000006", courses: [], competitions: 0 },
  { id: "coach-7", name: "אורן שגב", phone: "052-1000007", courses: ["שחמט מתקדמים"], competitions: 1 },
  { id: "coach-8", name: "ליאת מור", phone: "053-1000008", courses: ["שחמט מתחילים"], competitions: 2 },
  { id: "coach-9", name: "גיא רביב", phone: "050-1000009", courses: ["אימון קבוצתי", "שחמט מתקדמים"], competitions: 1 },
  { id: "coach-10", name: "שירה גל", phone: "054-1000010", courses: ["שחמט מתחילים", "מועדון אחה״צ"], competitions: 6 },
  { id: "coach-11", name: "עידן הראל", phone: "052-1000011", courses: ["שחמט מתקדמים"], competitions: 3 },
  { id: "coach-12", name: "נועה ברק", phone: "053-1000012", courses: [], competitions: 0 },
  { id: "coach-13", name: "אייל סופר", phone: "050-1000013", courses: ["שחמט מתחילים"], competitions: 2 },
  { id: "coach-14", name: "מעיין דקל", phone: "054-1000014", courses: [], competitions: 0 },
  { id: "coach-15", name: "אלון זיו", phone: "052-1000015", courses: ["שחמט מתקדמים", "אימון קבוצתי"], competitions: 4 },
  { id: "coach-16", name: "הילה כספי", phone: "053-1000016", courses: ["שחמט מתחילים"], competitions: 2 },
  { id: "coach-17", name: "נדב אורן", phone: "050-1000017", courses: ["שחמט מתקדמים"], competitions: 5 },
  { id: "coach-18", name: "רעות שני", phone: "054-1000018", courses: ["מועדון אחה״צ", "שחמט מתחילים"], competitions: 3 },
  { id: "coach-19", name: "ליאור פז", phone: "052-1000019", courses: [], competitions: 0 },
  { id: "coach-20", name: "מתן יערי", phone: "053-1000020", courses: ["שחמט מתקדמים"], competitions: 2 },
];

/** Default snapshot with derived status, ignoring runtime substitute overrides. */
export const coaches: Coach[] = coachSeeds.map((c) => ({
  ...c,
  tournaments: [],
  status: isCoachActive(c) ? "פעיל" : "לא פעיל",
}));

export const allCoachStatuses: CoachStatus[] = ["פעיל", "מחליף", "לא פעיל"];
