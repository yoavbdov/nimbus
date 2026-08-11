// ── Attendance domain ──────────────────────────────────────────────
// Each חוג (class) holds a roster of students and a list of מועדים (sessions).
// For every session we track one mark per student. A session with at least
// one "unset" student counts as חוסר (missing) and is flagged so the
// instructor knows exactly where to come back and fill it in.

export type AttendanceMark = "present" | "absent" | "unset";

// Tri-state click cycle: לא הוזן → נוכח → לא נוכח → לא הוזן …
export const ATTENDANCE_CYCLE: Record<AttendanceMark, AttendanceMark> = {
  unset: "present",
  present: "absent",
  absent: "unset",
};

export interface AttendanceStudent {
  id: string;
  name: string;
  rating: number;
}

export interface AttendanceSession {
  id: string;
  /** Display date, dd.mm.yyyy */
  date: string;
  /** Hebrew weekday + short date, e.g. "ראשון · 07.06" */
  label: string;
}

export interface AttendanceClass {
  id: string;
  name: string;
  coach: string;
  sessions: AttendanceSession[];
  students: AttendanceStudent[];
  /** True when the course is archived — shown only on demand, and read-only. */
  archived?: boolean;
}

/** marks[classId][sessionId][studentId] = AttendanceMark */
export type AttendanceMarks = Record<
  string,
  Record<string, Record<string, AttendanceMark>>
>;

/** comments[classId][sessionId][studentId] = free-text note */
export type AttendanceComments = Record<
  string,
  Record<string, Record<string, string>>
>;

// ── Seed data ──────────────────────────────────────────────────────

function students(...entries: [string, number][]): AttendanceStudent[] {
  return entries.map(([name, rating], i) => ({
    id: `s-${name}-${i}`,
    name,
    rating,
  }));
}

function sessions(...entries: [string, string][]): AttendanceSession[] {
  return entries.map(([label, date], i) => ({
    id: `ses-${date}-${i}`,
    date,
    label,
  }));
}

export const attendanceClasses: AttendanceClass[] = [
  {
    id: "attendance-1",
    name: "שחמט מתחילים",
    coach: "אבי לוי",
    sessions: sessions(
      ["ראשון · 17.05", "17.05.2026"],
      ["שלישי · 19.05", "19.05.2026"],
      ["ראשון · 24.05", "24.05.2026"],
      ["שלישי · 26.05", "26.05.2026"],
    ),
    students: students(
      ["אורי גולן", 600],
      ["יובל דוד", 750],
      ["נועם ברקת", 540],
      ["איתי שלו", 680],
      ["רוני מזרחי", 720],
      ["דניאל פרץ", 510],
      ["שירה לוין", 640],
      ["עומר טל", 590],
    ),
  },
  {
    id: "attendance-2",
    name: "שחמט מתקדמים",
    coach: "יוסי בן עמי",
    sessions: sessions(
      ["שני · 18.05", "18.05.2026"],
      ["רביעי · 20.05", "20.05.2026"],
      ["שני · 25.05", "25.05.2026"],
    ),
    students: students(
      ["ליאור ברק", 1450],
      ["מיה שפירא", 1380],
      ["יונתן קרן", 1290],
      ["שחר בן דוד", 1520],
      ["אורן שגב", 1410],
      ["טל הרפז", 1335],
      ["גלעד שני", 1470],
    ),
  },
  {
    id: "attendance-3",
    name: "מועדון אחה״צ",
    coach: "מירב כהן",
    sessions: sessions(
      ["חמישי · 21.05", "21.05.2026"],
      ["חמישי · 28.05", "28.05.2026"],
    ),
    students: students(
      ["נמרוד פז", 880],
      ["הילה כספי", 940],
      ["דור אביב", 760],
      ["רעות שני", 1010],
      ["מתן זיו", 820],
      ["שי לביא", 700],
    ),
  },
  {
    id: "attendance-4",
    name: "אימון קבוצתי",
    coach: "דנה אביב",
    sessions: sessions(
      ["שני · 18.05", "18.05.2026"],
      ["חמישי · 21.05", "21.05.2026"],
      ["שני · 25.05", "25.05.2026"],
      ["חמישי · 28.05", "28.05.2026"],
    ),
    students: students(
      ["רותם חן", 1620],
      ["אלון מור", 1555],
      ["נדב אורן", 1880],
      ["עידן הראל", 1740],
      ["מעיין דקל", 1490],
    ),
  },
  {
    id: "attendance-5",
    name: "חוג גן",
    coach: "ליאת מור",
    sessions: sessions(
      ["ראשון · 17.05", "17.05.2026"],
      ["רביעי · 20.05", "20.05.2026"],
      ["ראשון · 24.05", "24.05.2026"],
    ),
    students: students(
      ["עידו לב", 320],
      ["אגם רוזן", 280],
      ["יהלי גל", 360],
      ["נועה ברק", 300],
      ["איתמר דגן", 410],
      ["תמר אלון", 340],
      ["ליבי שמש", 290],
    ),
  },
];

// ── Initial marks ──────────────────────────────────────────────────
// Most students are marked נוכח, a scattering לא נוכח, and a few sessions
// are left partially blank (לא הוזן) to demonstrate the חוסר indicators.
// Sessions whose index is listed in `blanks` keep some students unset.

const blanks: Record<string, number[]> = {
  "ac-1": [2, 3], // two recent sessions still need filling
  "ac-2": [], // fully entered → no warning
  "ac-3": [1],
  "ac-4": [0, 3],
  "ac-5": [], // fully entered → no warning
};

function seedMark(
  classId: string,
  sessionIndex: number,
  studentIndex: number,
): AttendanceMark {
  if (blanks[classId]?.includes(sessionIndex) && studentIndex % 3 === 0) {
    return "unset";
  }
  return (studentIndex + sessionIndex) % 5 === 0 ? "absent" : "present";
}

export const initialAttendanceMarks: AttendanceMarks = Object.fromEntries(
  attendanceClasses.map((cls) => [
    cls.id,
    Object.fromEntries(
      cls.sessions.map((ses, si) => [
        ses.id,
        Object.fromEntries(
          cls.students.map((stu, ti) => [stu.id, seedMark(cls.id, si, ti)]),
        ),
      ]),
    ),
  ]),
);

export const initialAttendanceComments: AttendanceComments = Object.fromEntries(
  attendanceClasses.map((cls) => [
    cls.id,
    Object.fromEntries(cls.sessions.map((ses) => [ses.id, {}])),
  ]),
);
