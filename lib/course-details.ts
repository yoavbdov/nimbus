import { players } from "@/lib/players-data";
import { rooms, equipment } from "@/lib/rooms-data";
import {
  COURSE_DAYS,
  courseOccupancy,
  type Course,
  type CourseDay,
} from "@/lib/courses-data";
import { hebrewDayFromIso, type SessionDoc } from "@/lib/sessions-data";
import type { RelationDoc } from "@/lib/relations-data";
import {
  hebrewDayOf,
  type CourseFormValues,
  type MeetingValues,
  type EquipmentLineValues,
} from "@/lib/course-form";

/** A small, stable string hash (djb2-ish) with a seed for independent draws. */
function hash(str: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** "07.06.2026" → "2026-06-07"; "—"/invalid → "". */
function isoFromNextDate(nextDate: string): string {
  const m = nextDate.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return "";
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** "2026-06-07" → "07.06.2026"; invalid → "—". */
function nextDateFromIso(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "—";
}

/** The distinct weekdays a course's meetings run on (from each meeting's start
 * date), in week order. */
function daysFromMeetings(meetings: MeetingValues[]): CourseDay[] {
  const set = new Set(
    meetings.map((m) => hebrewDayFromIso(m.startDate)).filter(Boolean),
  );
  return COURSE_DAYS.filter((d) => set.has(d));
}

/** The first ISO date on/after `baseIso` that falls on the given weekday. */
function isoOnWeekday(baseIso: string, dayName: string): string {
  if (!baseIso) return "";
  const base = new Date(baseIso);
  if (Number.isNaN(base.getTime())) return "";
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    if (hebrewDayOf(iso) === dayName) return iso;
  }
  return baseIso;
}

/** A deterministic afternoon time window for an course's meetings. */
function timeWindow(course: Course): { start: string; end: string } {
  const startHour = 14 + (hash(course.id, 5381) % 5); // 14:00–18:00
  const duration = 1 + (hash(course.id, 131) % 2); // 1–2 hours
  return { start: `${pad(startHour)}:00`, end: `${pad(startHour + duration)}:00` };
}


/** One weekly, open-ended meeting per course day, all in the course's room. Its
 * start date lands on that weekday on/after the course's start. */
function meetingsFor(course: Course): MeetingValues[] {
  const { start, end } = timeWindow(course);
  const base = isoFromNextDate(course.nextDate);
  return course.days.map((day, i) => ({
    id: `meeting-${course.id}-${i}`,
    startDate: isoOnWeekday(base, day),
    room: course.room,
    startTime: start,
    endTime: end,
    frequency: "weekly",
    noEndDate: true,
    endDate: "",
  }));
}

/** The students already registered to this course (those whose clubs include it). */
function studentIdsFor(course: Course): string[] {
  return players.filter((p) => p.courses.includes(course.name)).map((p) => p.id);
}

/** Equipment lines derived from the gear that lives in the course's room. */
function equipmentFor(course: Course): EquipmentLineValues[] {
  const room = rooms.find((r) => r.name === course.room);
  if (!room) return [];
  const lines: EquipmentLineValues[] = [];
  room.equipment.forEach((name, i) => {
    const match = equipment.find(
      (e) => e.name.includes(name) || name.includes(e.name),
    );
    if (match && !lines.some((l) => l.equipmentId === match.name)) {
      lines.push({
        id: `equip-${course.id}-${i}`,
        equipmentId: match.name,
        quantity: String(1 + (hash(match.id, 7) % 3)),
      });
    }
  });
  return lines;
}

/**
 * Builds the full "edit course" form from an existing course. The roster
 * only stores a slice of these fields, so the rest (meetings, students,
 * equipment, notes, start date) is derived consistently from the course.
 */
export function courseFormValuesFor(course: Course): CourseFormValues {
  return {
    id: course.id,
    name: course.name,
    coach: course.coach,
    capacity: String(course.capacity),
    // A blank/zero bound is "no limit" — show it as an empty field, not "0".
    ratingMin: course.ratingMin ? String(course.ratingMin) : "",
    ratingMax: course.ratingMax ? String(course.ratingMax) : "",
    ageMin: course.ageMin ? String(course.ageMin) : "",
    ageMax: course.ageMax ? String(course.ageMax) : "",
    noAgeLimit: course.noAgeLimit ?? false,
    noRatingLimit: course.noRatingLimit ?? false,
    // Show exactly what's stored in Firestore (no fabricated fallback).
    notes: course.notes ?? "",
    meetings: meetingsFor(course),
    studentIds: studentIdsFor(course),
    equipment: equipmentFor(course),
  };
}

/** Rebuild a form meeting from a stored recurring session (edit prefill). */
function meetingFromSession(session: SessionDoc): MeetingValues {
  return {
    id: session.id,
    startDate: session.date,
    room: session.roomId,
    startTime: session.start,
    endTime: session.end,
    frequency: session.frequency ?? "weekly",
    noEndDate: session.noEndDate ?? false,
    endDate: session.endDate ?? "",
  };
}

/**
 * A course's meetings inferred from its own `days` + `times` fields. Used as a
 * fallback for courses that don't have `sessions` documents yet (e.g. seeded
 * courses whose slots weren't materialised), so the מפגשים tab isn't empty. Each
 * meeting's start date lands on its weekday on/after the course's start.
 */
function meetingsFromCourseShape(course: Course): MeetingValues[] {
  const base = isoFromNextDate(course.nextDate);
  return course.days.map((day, i) => {
    const t = course.times?.[day];
    return {
      id: `meeting-${course.id}-${i}`,
      startDate: isoOnWeekday(base, day),
      room: course.room,
      startTime: t?.start ?? "",
      endTime: t?.end ?? "",
      frequency: "weekly",
      noEndDate: true,
      endDate: "",
    };
  });
}

/**
 * Builds the "edit course" form from LIVE Firestore data: meetings come from the
 * course's `sessions`, enrolled students and equipment from its `relations`.
 * This is the courses-page path; the mock-derived {@link courseFormValuesFor}
 * stays for modules not yet migrated.
 */
export function courseFormValuesFromLive(
  course: Course,
  sessions: SessionDoc[],
  relations: RelationDoc[],
): CourseFormValues {
  const sessionMeetings = sessions
    .filter((s) => s.parentId === course.id)
    .map(meetingFromSession);
  const meetings = sessionMeetings.length
    ? sessionMeetings
    : meetingsFromCourseShape(course);
  const studentIds = relations
    .filter((r) => r.kind === "player_course" && r.targetId === course.id)
    .map((r) => r.subjectId);
  const equipmentLines: EquipmentLineValues[] = relations
    .filter((r) => r.kind === "equipment_course" && r.targetId === course.id)
    .map((r, i) => ({
      id: `equip-${course.id}-${i}`,
      equipmentId: r.subjectId,
      quantity: r.quantity != null ? String(r.quantity) : "1",
    }));
  return {
    id: course.id,
    name: course.name,
    coach: course.coach,
    capacity: String(course.capacity),
    // A blank/zero bound is "no limit" — show it as an empty field, not "0".
    ratingMin: course.ratingMin ? String(course.ratingMin) : "",
    ratingMax: course.ratingMax ? String(course.ratingMax) : "",
    ageMin: course.ageMin ? String(course.ageMin) : "",
    ageMax: course.ageMax ? String(course.ageMax) : "",
    noAgeLimit: course.noAgeLimit ?? false,
    noRatingLimit: course.noRatingLimit ?? false,
    notes: course.notes ?? "",
    meetings,
    studentIds,
    equipment: equipmentLines,
  };
}

/** The scalar course fields to persist, derived from the form. Days and next
 * date come from the meetings themselves (each has its own start date). */
function courseScalarsFromForm(values: CourseFormValues) {
  const capacity = Number(values.capacity) || 0;
  const startDates = values.meetings
    .map((m) => m.startDate)
    .filter(Boolean)
    .sort();
  return {
    name: values.name.trim(),
    coach: values.coach,
    ageMin: Number(values.ageMin) || 0,
    ageMax: Number(values.ageMax) || 0,
    ratingMin: Number(values.ratingMin) || 0,
    ratingMax: Number(values.ratingMax) || 0,
    noAgeLimit: values.noAgeLimit,
    noRatingLimit: values.noRatingLimit,
    capacity,
    days: daysFromMeetings(values.meetings),
    nextDate: startDates.length ? nextDateFromIso(startDates[0]) : "—",
    room: values.meetings[0]?.room ?? "",
    notes: values.notes,
  };
}

/** A full new-course document (derived counts start from the form). */
export function courseRecordFromForm(
  values: CourseFormValues,
): Omit<Course, "id"> {
  const scalars = courseScalarsFromForm(values);
  const enrolled = values.studentIds.length;
  return {
    ...scalars,
    enrolled,
    status: "פעיל",
    occupancy: courseOccupancy(enrolled, scalars.capacity),
  };
}

/** The patch applied when editing a course (derived counts are projected on read). */
export function courseEditPatch(values: CourseFormValues): Partial<Course> {
  return courseScalarsFromForm(values);
}
