export type CoachStatus = "פעיל" | "מחליף" | "לא פעיל";

export interface Coach {
  id: string;
  name: string;
  phone: string;
  clubs: string[];
  status: CoachStatus;
}

export const coaches: Coach[] = [
  { id: "c-1", name: "אבי לוי", phone: "050-1000001", clubs: ["שחמט מתחילים"], status: "פעיל" },
  { id: "c-2", name: "מירב כהן", phone: "054-1000002", clubs: ["שחמט מתחילים", "מועדון אחה״צ"], status: "פעיל" },
  { id: "c-3", name: "יוסי בן עמי", phone: "052-1000003", clubs: ["שחמט מתקדמים"], status: "פעיל" },
  { id: "c-4", name: "דנה אביב", phone: "053-1000004", clubs: ["אימון קבוצתי"], status: "מחליף" },
  { id: "c-5", name: "רון פרידמן", phone: "050-1000005", clubs: ["שחמט מתקדמים", "אימון קבוצתי"], status: "פעיל" },
  { id: "c-6", name: "תמר אלון", phone: "054-1000006", clubs: ["מועדון אחה״צ"], status: "לא פעיל" },
  { id: "c-7", name: "אורן שגב", phone: "052-1000007", clubs: ["שחמט מתקדמים"], status: "פעיל" },
  { id: "c-8", name: "ליאת מור", phone: "053-1000008", clubs: ["שחמט מתחילים"], status: "פעיל" },
  { id: "c-9", name: "גיא רביב", phone: "050-1000009", clubs: ["אימון קבוצתי", "שחמט מתקדמים"], status: "מחליף" },
  { id: "c-10", name: "שירה גל", phone: "054-1000010", clubs: ["שחמט מתחילים", "מועדון אחה״צ"], status: "פעיל" },
  { id: "c-11", name: "עידן הראל", phone: "052-1000011", clubs: ["שחמט מתקדמים"], status: "פעיל" },
  { id: "c-12", name: "נועה ברק", phone: "053-1000012", clubs: ["מועדון אחה״צ"], status: "לא פעיל" },
  { id: "c-13", name: "אייל סופר", phone: "050-1000013", clubs: ["שחמט מתחילים"], status: "פעיל" },
  { id: "c-14", name: "מעיין דקל", phone: "054-1000014", clubs: ["אימון קבוצתי"], status: "מחליף" },
  { id: "c-15", name: "אלון זיו", phone: "052-1000015", clubs: ["שחמט מתקדמים", "אימון קבוצתי"], status: "פעיל" },
  { id: "c-16", name: "הילה כספי", phone: "053-1000016", clubs: ["שחמט מתחילים"], status: "פעיל" },
  { id: "c-17", name: "נדב אורן", phone: "050-1000017", clubs: ["שחמט מתקדמים"], status: "פעיל" },
  { id: "c-18", name: "רעות שני", phone: "054-1000018", clubs: ["מועדון אחה״צ", "שחמט מתחילים"], status: "פעיל" },
  { id: "c-19", name: "ליאור פז", phone: "052-1000019", clubs: ["אימון קבוצתי"], status: "לא פעיל" },
  { id: "c-20", name: "מתן יערי", phone: "053-1000020", clubs: ["שחמט מתקדמים"], status: "פעיל" },
];

export const allCoachClubs = Array.from(
  new Set(coaches.flatMap((c) => c.clubs)),
).sort((a, b) => a.localeCompare(b, "he"));

export const allCoachStatuses: CoachStatus[] = ["פעיל", "מחליף", "לא פעיל"];
