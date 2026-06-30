import { equipment, type Equipment } from "@/lib/rooms-data";
import type { Player } from "@/lib/players-data";

/** How often a recurring meeting repeats. "once" is a single session. */
export type MeetingFrequency =
  | "once"
  | "weekly"
  | "biweekly"
  | "triweekly"
  | "monthly";

export const FREQUENCY_OPTIONS: { value: MeetingFrequency; label: string }[] = [
  { value: "once", label: "חד פעמי" },
  { value: "weekly", label: "שבועי" },
  { value: "biweekly", label: "פעם בשבועיים" },
  { value: "triweekly", label: "פעם בשלושה שבועות" },
  { value: "monthly", label: "פעם בחודש" },
];

/** A single recurring meeting: a weekday + room + time window + repeat rule. */
export interface MeetingValues {
  id: string;
  day: string;
  room: string;
  startTime: string;
  endTime: string;
  frequency: MeetingFrequency;
  /** When true the meeting repeats indefinitely and no end date is needed. */
  noEndDate: boolean;
  endDate: string;
}

/** A line of physical equipment reserved for the course. */
export interface EquipmentLineValues {
  id: string;
  equipmentId: string;
  quantity: string;
}

/** Shape of the "add course" form. Empty strings = not filled yet. */
export interface CourseFormValues {
  name: string;
  coach: string;
  capacity: string;
  fitnessMin: string;
  fitnessMax: string;
  ageMin: string;
  ageMax: string;
  notes: string;
  startDate: string;
  meetings: MeetingValues[];
  studentIds: string[];
  equipment: EquipmentLineValues[];
}

export const EMPTY_COURSE_FORM: CourseFormValues = {
  name: "",
  coach: "",
  capacity: "",
  fitnessMin: "",
  fitnessMax: "",
  ageMin: "",
  ageMax: "",
  notes: "",
  startDate: "",
  meetings: [],
  studentIds: [],
  equipment: [],
};

let idCounter = 0;
function makeId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export function makeMeeting(): MeetingValues {
  return {
    id: makeId("meeting"),
    day: "",
    room: "",
    startTime: "",
    endTime: "",
    frequency: "weekly",
    noEndDate: false,
    endDate: "",
  };
}

export function makeEquipmentLine(): EquipmentLineValues {
  return { id: makeId("equip"), equipmentId: "", quantity: "1" };
}

/**
 * A recurring meeting must have every field filled once it's opened, and a
 * valid end date when one is required.
 */
export function meetingComplete(meeting: MeetingValues): boolean {
  if (!meeting.day || !meeting.room || !meeting.startTime || !meeting.endTime) {
    return false;
  }
  if (meetingNeedsEndDate(meeting)) {
    if (!meeting.endDate || !meetingEndDateValid(meeting)) return false;
  }
  return true;
}

/** Name and start date are required; any opened meeting must be fully filled. */
export function isCourseFormValid(values: CourseFormValues): boolean {
  if (values.name.trim() === "") return false;
  if (!values.startDate) return false;
  return values.meetings.every(meetingComplete);
}

const HEBREW_DAY_BY_JS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export function hebrewDayOf(iso: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return HEBREW_DAY_BY_JS[date.getDay()];
}

/**
 * A recurring meeting's end date must land on the same weekday it runs on.
 * "once" meetings and open-ended ones need no end date, so they're always valid.
 */
export function meetingEndDateValid(meeting: MeetingValues): boolean {
  if (meeting.frequency === "once" || meeting.noEndDate) return true;
  if (!meeting.endDate || !meeting.day) return true;
  return hebrewDayOf(meeting.endDate) === meeting.day;
}

export function meetingNeedsEndDate(meeting: MeetingValues): boolean {
  return meeting.frequency !== "once" && !meeting.noEndDate;
}

/** A stable, made-up "free right now" count per equipment item (display only). */
export function equipmentAvailableNow(equipmentId: string): number {
  const item = equipment.find((e) => e.id === equipmentId);
  if (!item) return 0;
  // Deterministic pseudo-availability: somewhere between ~40% and full stock.
  const seed = item.id.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
  const span = Math.max(1, Math.floor(item.quantity * 0.6));
  return item.quantity - (Math.abs(seed) % span);
}

export function equipmentById(equipmentId: string): Equipment | undefined {
  return equipment.find((e) => e.id === equipmentId);
}

/** Whether a student falls within the course's age and fitness ranges. */
export function meetsCriteria(player: Player, values: CourseFormValues): boolean {
  const ageMin = values.ageMin ? Number(values.ageMin) : null;
  const ageMax = values.ageMax ? Number(values.ageMax) : null;
  const fitMin = values.fitnessMin ? Number(values.fitnessMin) : null;
  const fitMax = values.fitnessMax ? Number(values.fitnessMax) : null;

  if (ageMin != null && player.age < ageMin) return false;
  if (ageMax != null && player.age > ageMax) return false;
  if (fitMin != null && player.israeliRating < fitMin) return false;
  if (fitMax != null && player.israeliRating > fitMax) return false;
  return true;
}
