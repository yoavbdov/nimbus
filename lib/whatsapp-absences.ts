// ── Absence streaks ────────────────────────────────────────────────
// Students who were marked absent in several consecutive sessions of the
// same class, so their parents can be contacted. Mock data for now.

export interface AbsenceStreak {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  /** Number of consecutive recent sessions marked absent. */
  streak: number;
  /** Display date of the last attended session, dd.mm.yyyy. */
  lastSeen: string;
}

const mockAbsentees: AbsenceStreak[] = [
  { studentId: "s-ab-1", studentName: "אורי גולן", classId: "ac-1", className: "שחמט מתחילים", streak: 4, lastSeen: "05.05.2026" },
  { studentId: "s-ab-2", studentName: "נועם ברקת", classId: "ac-1", className: "שחמט מתחילים", streak: 2, lastSeen: "19.05.2026" },
  { studentId: "s-ab-3", studentName: "מיה שפירא", classId: "ac-2", className: "שחמט מתקדמים", streak: 3, lastSeen: "11.05.2026" },
  { studentId: "s-ab-4", studentName: "דור אביב", classId: "ac-3", className: "מועדון אחה״צ", streak: 5, lastSeen: "30.04.2026" },
  { studentId: "s-ab-5", studentName: "מתן זיו", classId: "ac-3", className: "מועדון אחה״צ", streak: 2, lastSeen: "21.05.2026" },
  { studentId: "s-ab-6", studentName: "רותם חן", classId: "ac-4", className: "אימון קבוצתי", streak: 3, lastSeen: "14.05.2026" },
  { studentId: "s-ab-7", studentName: "עידו לב", classId: "ac-5", className: "חוג גן", streak: 2, lastSeen: "20.05.2026" },
  { studentId: "s-ab-8", studentName: "ליבי שמש", classId: "ac-5", className: "חוג גן", streak: 4, lastSeen: "06.05.2026" },
];

/** Students whose trailing absence streak meets the given threshold. */
export function absenceStreaksAtLeast(threshold: number): AbsenceStreak[] {
  return mockAbsentees
    .filter((s) => s.streak >= threshold)
    .sort((a, b) => b.streak - a.streak);
}

/** Default consecutive-absence threshold (configurable in the tool). */
export const DEFAULT_ABSENCE_THRESHOLD = 2;

export const ABSENCE_PLACEHOLDERS = [
  "{שם}",
  "{חוג}",
  "{היעדרויות}",
  "{תאריך}",
] as const;

export const DEFAULT_ABSENCE_TEMPLATE =
  'שלום, 👋\nשמנו לב ש{שם} נעדר/ה מ-{היעדרויות} מפגשים אחרונים בחוג "{חוג}" (נראה/תה לאחרונה ב-{תאריך}).\nנשמח לדעת אם הכל בסדר ומתי נוכל לראותכם שוב. תודה!';

/** Fills the absence template with a specific student's details. */
export function fillAbsenceMessage(
  templateBody: string,
  item: AbsenceStreak,
): string {
  return templateBody
    .replaceAll("{שם}", item.studentName)
    .replaceAll("{חוג}", item.className)
    .replaceAll("{היעדרויות}", String(item.streak))
    .replaceAll("{תאריך}", item.lastSeen);
}
