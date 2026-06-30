import { players } from "@/lib/players-data";
import { rooms, equipment } from "@/lib/rooms-data";
import type { Course } from "@/lib/courses-data";
import {
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

/** A deterministic afternoon time window for an course's meetings. */
function timeWindow(course: Course): { start: string; end: string } {
  const startHour = 14 + (hash(course.id, 5381) % 5); // 14:00–18:00
  const duration = 1 + (hash(course.id, 131) % 2); // 1–2 hours
  return { start: `${pad(startHour)}:00`, end: `${pad(startHour + duration)}:00` };
}

/** Built-from-data notes so every course shows something in its details. */
function notesFor(course: Course): string {
  const dayList = course.days.join(", ");
  const coachLine = course.coach
    ? `החוג מועבר על ידי ${course.coach}.`
    : "טרם שובץ מדריך לחוג.";
  return `${coachLine} מתקיים בימים: ${dayList || "—"}, בחדר ${course.room}. מיועד לגילאי ${course.ageMin}–${course.ageMax} ולמד כושר ${course.fitnessMin}–${course.fitnessMax}.`;
}

/** One weekly, open-ended meeting per course day, all in the course's room. */
function meetingsFor(course: Course): MeetingValues[] {
  const { start, end } = timeWindow(course);
  return course.days.map((day, i) => ({
    id: `meeting-${course.id}-${i}`,
    day,
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
  return players.filter((p) => p.clubs.includes(course.name)).map((p) => p.id);
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
    name: course.name,
    coach: course.coach,
    capacity: String(course.capacity),
    fitnessMin: String(course.fitnessMin),
    fitnessMax: String(course.fitnessMax),
    ageMin: String(course.ageMin),
    ageMax: String(course.ageMax),
    notes: notesFor(course),
    startDate: isoFromNextDate(course.nextDate),
    meetings: meetingsFor(course),
    studentIds: studentIdsFor(course),
    equipment: equipmentFor(course),
  };
}
