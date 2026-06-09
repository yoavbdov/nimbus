import { players } from "@/lib/players-data";
import { rooms, equipment } from "@/lib/rooms-data";
import type { Activity } from "@/lib/activities-data";
import {
  type ActivityFormValues,
  type MeetingValues,
  type EquipmentLineValues,
} from "@/lib/activity-form";

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

/** A deterministic afternoon time window for an activity's meetings. */
function timeWindow(activity: Activity): { start: string; end: string } {
  const startHour = 14 + (hash(activity.id, 5381) % 5); // 14:00–18:00
  const duration = 1 + (hash(activity.id, 131) % 2); // 1–2 hours
  return { start: `${pad(startHour)}:00`, end: `${pad(startHour + duration)}:00` };
}

/** Built-from-data notes so every activity shows something in its details. */
function notesFor(activity: Activity): string {
  const dayList = activity.days.join(", ");
  const coachLine = activity.coach
    ? `החוג מועבר על ידי ${activity.coach}.`
    : "טרם שובץ מדריך לחוג.";
  return `${coachLine} מתקיים בימים: ${dayList || "—"}, בחדר ${activity.room}. מיועד לגילאי ${activity.ageMin}–${activity.ageMax} ולמד כושר ${activity.fitnessMin}–${activity.fitnessMax}.`;
}

/** One weekly, open-ended meeting per activity day, all in the activity's room. */
function meetingsFor(activity: Activity): MeetingValues[] {
  const { start, end } = timeWindow(activity);
  return activity.days.map((day, i) => ({
    id: `meeting-${activity.id}-${i}`,
    day,
    room: activity.room,
    startTime: start,
    endTime: end,
    frequency: "weekly",
    noEndDate: true,
    endDate: "",
  }));
}

/** The students already registered to this activity (those whose clubs include it). */
function studentIdsFor(activity: Activity): string[] {
  return players.filter((p) => p.clubs.includes(activity.name)).map((p) => p.id);
}

/** Equipment lines derived from the gear that lives in the activity's room. */
function equipmentFor(activity: Activity): EquipmentLineValues[] {
  const room = rooms.find((r) => r.name === activity.room);
  if (!room) return [];
  const lines: EquipmentLineValues[] = [];
  room.equipment.forEach((name, i) => {
    const match = equipment.find(
      (e) => e.name.includes(name) || name.includes(e.name),
    );
    if (match && !lines.some((l) => l.equipmentId === match.name)) {
      lines.push({
        id: `equip-${activity.id}-${i}`,
        equipmentId: match.name,
        quantity: String(1 + (hash(match.id, 7) % 3)),
      });
    }
  });
  return lines;
}

/**
 * Builds the full "edit activity" form from an existing activity. The roster
 * only stores a slice of these fields, so the rest (meetings, students,
 * equipment, notes, start date) is derived consistently from the activity.
 */
export function activityFormValuesFor(activity: Activity): ActivityFormValues {
  return {
    name: activity.name,
    coach: activity.coach,
    capacity: String(activity.capacity),
    fitnessMin: String(activity.fitnessMin),
    fitnessMax: String(activity.fitnessMax),
    ageMin: String(activity.ageMin),
    ageMax: String(activity.ageMax),
    notes: notesFor(activity),
    startDate: isoFromNextDate(activity.nextDate),
    meetings: meetingsFor(activity),
    studentIds: studentIdsFor(activity),
    equipment: equipmentFor(activity),
  };
}
