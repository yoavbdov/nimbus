import { useEffect, useMemo, useState } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import { toISODate } from "@/lib/calendar";
import type { Course } from "@/lib/courses-data";
import type { Player } from "@/lib/players-data";
import type { RelationDoc } from "@/lib/relations-data";
import type { SessionDoc } from "@/lib/sessions-data";
import {
  ATTENDANCE_CYCLE,
  type AttendanceClass,
  type AttendanceMark,
  type AttendanceSession,
} from "@/lib/attendance-data";
import {
  courseAttendanceSessions,
  isFilled,
  memberOnSession,
  sessionKey,
  type AttendanceEntry,
  type AttendanceSessionDoc,
} from "@/lib/attendance-model";
import {
  setAttendanceComment,
  setAttendanceMark,
  setAttendanceMarksForSession,
} from "@/lib/firebase/data/attendance";

const ARCHIVED = "ארכיון";

const EMPTY_SESSION: AttendanceSession = { id: "", date: "", label: "—" };
const EMPTY_CLASS: AttendanceClass = {
  id: "",
  name: "—",
  coach: "",
  sessions: [],
  students: [],
  archived: false,
};

/** One current member of a course, with the date they were enrolled. */
interface Member {
  id: string;
  joinedOn?: string;
}

/**
 * Owns the attendance page's state, composing four live collections — courses,
 * their meetings (`sessions`), enrolments (`player_course` relations) and the
 * per-session attendance docs (`attendance`) — into the חוג / מועד / roster the
 * UI renders.
 *
 * Sessions are the real past occurrences of each course's meetings (never a
 * hand-authored list); a session's roster is the course's current members as of
 * that date, unioned with anyone already recorded on it — so a student who left
 * keeps his history on old sessions but drops off new ones. Because a status
 * (even "unset") is stored, a recorded student never disappears. Archived
 * courses are hidden until asked for, and then shown read-only.
 */
export function useAttendancePanel() {
  const { data: courses } = useCollection<Course>("courses");
  const { data: relations } = useCollection<RelationDoc>("relations");
  const { data: sessions } = useCollection<SessionDoc>("sessions");
  const { data: players } = useCollection<Player>("players");
  const { data: attendanceDocs } = useCollection<AttendanceSessionDoc>("attendance");

  const [classId, setClassId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [showArchived, setShowArchived] = useState(false);
  // Local edits to comment inputs, keyed `${sessionId}::${studentId}`; persisted
  // on blur so typing doesn't write on every keystroke.
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const todayIso = toISODate(new Date());

  // ── Projections off the live relations ────────────────────────────────────
  const coachByCourse = useMemo(() => {
    const map = new Map<string, string>();
    for (const rel of relations) {
      if (rel.kind === "coach_course") map.set(rel.targetId, rel.subjectId);
    }
    return map;
  }, [relations]);

  const membersByCourse = useMemo(() => {
    const map = new Map<string, Member[]>();
    for (const rel of relations) {
      if (rel.kind !== "player_course") continue;
      const list = map.get(rel.targetId) ?? [];
      list.push({ id: rel.subjectId, joinedOn: rel.joinedOn });
      map.set(rel.targetId, list);
    }
    return map;
  }, [relations]);

  const playerById = useMemo(() => {
    const map = new Map<string, Player>();
    for (const p of players) map.set(p.id, p);
    return map;
  }, [players]);

  // Indexed by the session document id (`courseId__date`), so a meeting's roster
  // is one lookup. `entriesFor` returns that meeting's stored entries (or none).
  const attendanceBySession = useMemo(() => {
    const map = new Map<string, AttendanceSessionDoc>();
    for (const doc of attendanceDocs) map.set(doc.id, doc);
    return map;
  }, [attendanceDocs]);

  const entriesFor = useMemo(
    () =>
      (courseId: string, date: string): Record<string, AttendanceEntry> =>
        attendanceBySession.get(sessionKey(courseId, date))?.entries ?? {},
    [attendanceBySession],
  );

  // ── The חוג list (courses → attendance classes) ───────────────────────────
  const classes = useMemo<AttendanceClass[]>(() => {
    return courses
      .filter((course) => showArchived || course.status !== ARCHIVED)
      .map((course) => {
        const members = membersByCourse.get(course.id) ?? [];
        return {
          id: course.id,
          name: course.name,
          coach: coachByCourse.get(course.id) ?? course.coach ?? "",
          archived: course.status === ARCHIVED,
          sessions: courseAttendanceSessions(
            sessions.filter((s) => s.parentId === course.id),
            todayIso,
          ),
          students: members.map((m) => ({
            id: m.id,
            name: playerById.get(m.id)?.name ?? m.id,
            rating: playerById.get(m.id)?.israeliRating ?? 0,
          })),
        };
      })
      // Active courses first, then archived; alphabetical within each group.
      .sort(
        (a, b) =>
          Number(a.archived) - Number(b.archived) ||
          a.name.localeCompare(b.name, "he"),
      );
  }, [courses, showArchived, membersByCourse, coachByCourse, sessions, playerById, todayIso]);

  // How many courses are archived — drives whether the "show archived" toggle
  // is offered at all (no archived חוגים → no toggle).
  const archivedCount = useMemo(
    () => courses.filter((c) => c.status === ARCHIVED).length,
    [courses],
  );

  const activeClass = useMemo(
    () => classes.find((c) => c.id === classId) ?? classes[0] ?? EMPTY_CLASS,
    [classes, classId],
  );

  // Default to the most recent session (attendance is usually filled latest-first).
  const activeSession = useMemo(
    () =>
      activeClass.sessions.find((s) => s.id === sessionId) ??
      activeClass.sessions[activeClass.sessions.length - 1] ??
      EMPTY_SESSION,
    [activeClass, sessionId],
  );

  const readOnly = activeClass.archived === true;

  // Deep link support: /attendance?class=…&session=… jumps to a specific מועד
  // (used by the "נוכחות חסרה" tool). Applied once on mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cls = params.get("class");
    const ses = params.get("session");
    if (!cls && !ses) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time URL sync
    if (cls) setClassId(cls);
    if (ses) setSessionId(ses);
  }, []);

  // ── Whether a session still needs filling ─────────────────────────────────
  // A session is "missing" when a current member enrolled by that date has no
  // filled (present/absent) status yet — a stored "unset" still counts as
  // missing. Departed students carry their own status and never affect this.
  const sessionMissing = useMemo(
    () =>
      (courseId: string, sessionIso: string): boolean => {
        const entries = entriesFor(courseId, sessionIso);
        return (membersByCourse.get(courseId) ?? []).some(
          (m) =>
            memberOnSession(m.joinedOn, sessionIso) &&
            !isFilled(entries[m.id]?.status),
        );
      },
    [entriesFor, membersByCourse],
  );

  const classMissingCount = useMemo(() => {
    const result: Record<string, number> = {};
    for (const cls of classes) {
      result[cls.id] = cls.archived
        ? 0
        : cls.sessions.filter((s) => sessionMissing(cls.id, s.id)).length;
    }
    return result;
  }, [classes, sessionMissing]);

  const sessionMissingById = useMemo(() => {
    const result: Record<string, boolean> = {};
    for (const s of activeClass.sessions) {
      result[s.id] = !activeClass.archived && sessionMissing(activeClass.id, s.id);
    }
    return result;
  }, [activeClass, sessionMissing]);

  // ── The active session's roster ───────────────────────────────────────────
  const roster = useMemo(() => {
    const sessionIso = activeSession.id;
    const entries = entriesFor(activeClass.id, sessionIso);

    const members = (membersByCourse.get(activeClass.id) ?? []).filter((m) =>
      memberOnSession(m.joinedOn, sessionIso),
    );
    const ids = members.map((m) => m.id);
    // Anyone recorded on this session (incl. departed students, whose stored
    // status keeps them here) shows after the current members.
    const seen = new Set(ids);
    for (const id of Object.keys(entries)) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }

    return ids.map((id) => {
      const draft = commentDrafts[`${sessionIso}::${id}`];
      return {
        id,
        name: playerById.get(id)?.name ?? id,
        rating: playerById.get(id)?.israeliRating ?? 0,
        mark: entries[id]?.status ?? ("unset" as AttendanceMark),
        comment: draft ?? entries[id]?.comment ?? "",
      };
    });
  }, [activeSession, activeClass, entriesFor, membersByCourse, playerById, commentDrafts]);

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

  // ── Actions ───────────────────────────────────────────────────────────────
  function selectClass(id: string) {
    const next = classes.find((c) => c.id === id);
    if (!next) return;
    setClassId(id);
    setSessionId(next.sessions[next.sessions.length - 1]?.id ?? "");
  }

  function cycleMark(studentId: string) {
    if (readOnly || !activeSession.id) return;
    const current =
      entriesFor(activeClass.id, activeSession.id)[studentId]?.status ?? "unset";
    void setAttendanceMark(
      activeClass.id,
      activeSession.id,
      studentId,
      ATTENDANCE_CYCLE[current],
    );
  }

  function setComment(studentId: string, value: string) {
    if (readOnly) return;
    setCommentDrafts((prev) => ({
      ...prev,
      [`${activeSession.id}::${studentId}`]: value,
    }));
  }

  function commitComment(studentId: string) {
    if (readOnly || !activeSession.id) return;
    const key = `${activeSession.id}::${studentId}`;
    const draft = commentDrafts[key];
    if (draft === undefined) return;
    void setAttendanceComment(activeClass.id, activeSession.id, studentId, draft);
  }

  function markAll(mark: Exclude<AttendanceMark, "unset">) {
    if (readOnly || !activeSession.id || roster.length === 0) return;
    void setAttendanceMarksForSession(
      activeClass.id,
      activeSession.id,
      roster.map((r) => r.id),
      mark,
    );
  }

  return {
    classes,
    activeClass,
    activeSession,
    classId: activeClass.id,
    sessionId: activeSession.id,
    roster,
    counts,
    classMissingCount,
    sessionMissingById,
    readOnly,
    showArchived,
    setShowArchived,
    archivedCount,
    selectClass,
    selectSession: setSessionId,
    cycleMark,
    setComment,
    commitComment,
    markAll,
  };
}
