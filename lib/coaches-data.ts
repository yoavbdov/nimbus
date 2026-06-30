export type CoachStatus = "פעיל" | "מחליף" | "לא פעיל";

/** Raw coach data as stored. Status is derived, never stored. */
export interface CoachRecord {
  id: string;
  name: string;
  phone: string;
  clubs: string[];
  competitions: number;
}

export interface Coach extends CoachRecord {
  status: CoachStatus;
}

export const coachRecords: CoachRecord[] = [
  { id: "coach-1", name: "אבי לוי", phone: "050-1000001", clubs: ["שחמט מתחילים"], competitions: 3 },
  { id: "coach-2", name: "מירב כהן", phone: "054-1000002", clubs: ["שחמט מתחילים", "מועדון אחה״צ", "אימון קבוצתי", "שחמט מתקדמים", "סדנת פתיחות"], competitions: 5 },
  { id: "coach-3", name: "יוסי בן עמי", phone: "052-1000003", clubs: ["שחמט מתקדמים"], competitions: 2 },
  { id: "coach-4", name: "דנה אביב", phone: "053-1000004", clubs: [], competitions: 0 },
  { id: "coach-5", name: "רון פרידמן", phone: "050-1000005", clubs: ["שחמט מתקדמים", "אימון קבוצתי"], competitions: 4 },
  { id: "coach-6", name: "תמר אלון", phone: "054-1000006", clubs: [], competitions: 0 },
  { id: "coach-7", name: "אורן שגב", phone: "052-1000007", clubs: ["שחמט מתקדמים"], competitions: 1 },
  { id: "coach-8", name: "ליאת מור", phone: "053-1000008", clubs: ["שחמט מתחילים"], competitions: 2 },
  { id: "coach-9", name: "גיא רביב", phone: "050-1000009", clubs: ["אימון קבוצתי", "שחמט מתקדמים"], competitions: 1 },
  { id: "coach-10", name: "שירה גל", phone: "054-1000010", clubs: ["שחמט מתחילים", "מועדון אחה״צ"], competitions: 6 },
  { id: "coach-11", name: "עידן הראל", phone: "052-1000011", clubs: ["שחמט מתקדמים"], competitions: 3 },
  { id: "coach-12", name: "נועה ברק", phone: "053-1000012", clubs: [], competitions: 0 },
  { id: "coach-13", name: "אייל סופר", phone: "050-1000013", clubs: ["שחמט מתחילים"], competitions: 2 },
  { id: "coach-14", name: "מעיין דקל", phone: "054-1000014", clubs: [], competitions: 0 },
  { id: "coach-15", name: "אלון זיו", phone: "052-1000015", clubs: ["שחמט מתקדמים", "אימון קבוצתי"], competitions: 4 },
  { id: "coach-16", name: "הילה כספי", phone: "053-1000016", clubs: ["שחמט מתחילים"], competitions: 2 },
  { id: "coach-17", name: "נדב אורן", phone: "050-1000017", clubs: ["שחמט מתקדמים"], competitions: 5 },
  { id: "coach-18", name: "רעות שני", phone: "054-1000018", clubs: ["מועדון אחה״צ", "שחמט מתחילים"], competitions: 3 },
  { id: "coach-19", name: "ליאור פז", phone: "052-1000019", clubs: [], competitions: 0 },
  { id: "coach-20", name: "מתן יערי", phone: "053-1000020", clubs: ["שחמט מתקדמים"], competitions: 2 },
];

/** A coach is active while responsible for at least one club or competition. */
export function isCoachActive(c: CoachRecord): boolean {
  return c.competitions > 0 || c.clubs.length > 0;
}

/** Default snapshot with derived status, ignoring runtime substitute overrides. */
export const coaches: Coach[] = coachRecords.map((c) => ({
  ...c,
  status: isCoachActive(c) ? "פעיל" : "לא פעיל",
}));

export const allCoachClubs = Array.from(
  new Set(coachRecords.flatMap((c) => c.clubs)),
).sort((a, b) => a.localeCompare(b, "he"));

export const allCoachStatuses: CoachStatus[] = ["פעיל", "מחליף", "לא פעיל"];
