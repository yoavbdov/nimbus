import {
  attendanceClasses,
  initialAttendanceMarks,
} from "@/lib/attendance-data";

// ── Missing attendance ─────────────────────────────────────────────
// Surfaces only the classes that still have sessions where attendance was
// never fully entered (at least one student left as "unset"). Each such
// session reports how many students are still missing a mark.

export interface MissingSession {
  id: string;
  label: string;
  date: string;
  missingCount: number;
  totalStudents: number;
}

export interface MissingAttendanceClass {
  id: string;
  name: string;
  coach: string;
  sessions: MissingSession[];
  /** Total unset marks across the class — handy for sorting/summary. */
  totalMissing: number;
}

export const missingAttendanceClasses: MissingAttendanceClass[] =
  attendanceClasses
    .map((cls) => {
      const sessions: MissingSession[] = cls.sessions
        .map((ses) => {
          const marks = initialAttendanceMarks[cls.id]?.[ses.id] ?? {};
          const missingCount = cls.students.filter(
            (stu) => marks[stu.id] === "unset" || marks[stu.id] === undefined,
          ).length;
          return {
            id: ses.id,
            label: ses.label,
            date: ses.date,
            missingCount,
            totalStudents: cls.students.length,
          };
        })
        .filter((ses) => ses.missingCount > 0);

      return {
        id: cls.id,
        name: cls.name,
        coach: cls.coach,
        sessions,
        totalMissing: sessions.reduce((sum, s) => sum + s.missingCount, 0),
      };
    })
    .filter((cls) => cls.sessions.length > 0);
