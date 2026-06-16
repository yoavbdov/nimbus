import { useEffect, useMemo, useState } from "react";
import {
  ATTENDANCE_CYCLE,
  attendanceClasses,
  initialAttendanceComments,
  initialAttendanceMarks,
  type AttendanceComments,
  type AttendanceMark,
  type AttendanceMarks,
} from "@/lib/attendance-data";

/** Deep clone so component edits never mutate the seed module. */
function clone<T>(value: T): T {
  return structuredClone(value);
}

/** A session is חוסר when at least one student is still "unset". */
function sessionMissing(session: Record<string, AttendanceMark> | undefined): boolean {
  if (!session) return true;
  return Object.values(session).some((m) => m === "unset");
}

/**
 * Owns the attendance editing state for the whole page: the selected חוג and
 * מועד, every student mark and comment, the tri-state click cycle, the bulk
 * fill actions, and the derived חוסר indicators — a missing-dates count per
 * class and a per-session missing flag.
 */
export function useAttendancePanel() {
  const [marks, setMarks] = useState<AttendanceMarks>(() =>
    clone(initialAttendanceMarks),
  );
  const [comments, setComments] = useState<AttendanceComments>(() =>
    clone(initialAttendanceComments),
  );
  const [classId, setClassId] = useState<string>(attendanceClasses[0].id);
  const [sessionId, setSessionId] = useState<string>(
    attendanceClasses[0].sessions[0].id,
  );

  // Deep link support: /attendance?class=…&session=… jumps straight to the
  // missing session (used by the "נוכחות חסרה" tool). Applied once on mount —
  // a deliberate one-time sync from the URL, not reactive state.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cls = attendanceClasses.find((c) => c.id === params.get("class"));
    if (!cls) return;
    const wanted = params.get("session");
    const session = cls.sessions.find((s) => s.id === wanted);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time URL sync
    setClassId(cls.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time URL sync
    setSessionId(session ? session.id : cls.sessions[0].id);
  }, []);

  const activeClass = useMemo(
    () => attendanceClasses.find((c) => c.id === classId) ?? attendanceClasses[0],
    [classId],
  );

  const activeSession = useMemo(
    () =>
      activeClass.sessions.find((s) => s.id === sessionId) ??
      activeClass.sessions[0],
    [activeClass, sessionId],
  );

  // How many of each class's sessions still need filling.
  const classMissingCount = useMemo(() => {
    const result: Record<string, number> = {};
    for (const cls of attendanceClasses) {
      result[cls.id] = cls.sessions.filter((s) =>
        sessionMissing(marks[cls.id]?.[s.id]),
      ).length;
    }
    return result;
  }, [marks]);

  // Which sessions of the active class are missing data.
  const sessionMissingById = useMemo(() => {
    const result: Record<string, boolean> = {};
    for (const s of activeClass.sessions) {
      result[s.id] = sessionMissing(marks[activeClass.id]?.[s.id]);
    }
    return result;
  }, [marks, activeClass]);

  const sessionMarks = marks[activeClass.id]?.[activeSession.id] ?? {};
  const sessionComments = comments[activeClass.id]?.[activeSession.id] ?? {};

  // Roster of the active session, each row carrying its mark + comment.
  const roster = useMemo(
    () =>
      activeClass.students.map((student) => ({
        ...student,
        mark: sessionMarks[student.id] ?? ("unset" as AttendanceMark),
        comment: sessionComments[student.id] ?? "",
      })),
    [activeClass, sessionMarks, sessionComments],
  );

  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let unset = 0;
    for (const r of roster) {
      if (r.mark === "present") present++;
      else if (r.mark === "absent") absent++;
      else unset++;
    }
    return { present, absent, unset, total: roster.length };
  }, [roster]);

  function selectClass(id: string) {
    const next = attendanceClasses.find((c) => c.id === id);
    if (!next) return;
    setClassId(id);
    setSessionId(next.sessions[0].id);
  }

  function cycleMark(studentId: string) {
    setMarks((prev) => {
      const next = clone(prev);
      const session = ((next[activeClass.id] ??= {})[activeSession.id] ??= {});
      session[studentId] = ATTENDANCE_CYCLE[session[studentId] ?? "unset"];
      return next;
    });
  }

  function setComment(studentId: string, value: string) {
    setComments((prev) => {
      const next = clone(prev);
      const session = ((next[activeClass.id] ??= {})[activeSession.id] ??= {});
      session[studentId] = value;
      return next;
    });
  }

  function markAll(mark: Exclude<AttendanceMark, "unset">) {
    setMarks((prev) => {
      const next = clone(prev);
      const session = ((next[activeClass.id] ??= {})[activeSession.id] ??= {});
      for (const student of activeClass.students) {
        session[student.id] = mark;
      }
      return next;
    });
  }

  return {
    classes: attendanceClasses,
    activeClass,
    activeSession,
    classId,
    sessionId,
    roster,
    counts,
    classMissingCount,
    sessionMissingById,
    selectClass,
    selectSession: setSessionId,
    cycleMark,
    setComment,
    markAll,
  };
}
