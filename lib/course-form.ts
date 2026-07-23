import { type Equipment } from "@/lib/rooms-data";
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

/**
 * A single recurring meeting: a start date + room + time window + repeat rule.
 * The weekday it runs on is derived from `startDate` (see {@link hebrewDayOf}),
 * so a meeting is described exactly like a fixed tournament slot.
 */
export interface MeetingValues {
  id: string;
  /** ISO date the series starts on; its weekday is the day the meeting runs. */
  startDate: string;
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
  /** Set when editing an existing course; drives the Firestore save. */
  id?: string;
  name: string;
  coach: string;
  capacity: string;
  ratingMin: string;
  ratingMax: string;
  ageMin: string;
  ageMax: string;
  /** When on, the age / rating range imposes no limit and its inputs are ignored. */
  noAgeLimit: boolean;
  noRatingLimit: boolean;
  notes: string;
  meetings: MeetingValues[];
  studentIds: string[];
  equipment: EquipmentLineValues[];
}

export const EMPTY_COURSE_FORM: CourseFormValues = {
  name: "",
  coach: "",
  capacity: "",
  ratingMin: "",
  ratingMax: "",
  ageMin: "",
  ageMax: "",
  noAgeLimit: false,
  noRatingLimit: false,
  notes: "",
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
    startDate: "",
    room: "",
    startTime: "",
    endTime: "",
    frequency: "weekly",
    noEndDate: false,
    endDate: "",
  };
}

export function makeEquipmentLine(
  existing: { equipmentId: string }[] = [],
  items: Equipment[] = [],
): EquipmentLineValues {
  // Default to the first item not already picked by another line (each physical
  // item can be added only once), rather than an empty "בחר ציוד". `items` is
  // the live equipment roster (Firestore) — an empty roster leaves the line blank.
  const taken = new Set(existing.map((l) => l.equipmentId).filter(Boolean));
  const firstAvailable = items.find((e) => !taken.has(e.name));
  return {
    id: makeId("equip"),
    equipmentId: firstAvailable?.name ?? "",
    quantity: "1",
  };
}

/**
 * A recurring meeting must have every field filled once it's opened, and a
 * valid end date when one is required.
 */
export function meetingComplete(meeting: MeetingValues): boolean {
  if (
    !meeting.startDate ||
    !meeting.room ||
    !meeting.startTime ||
    !meeting.endTime
  ) {
    return false;
  }
  if (meetingNeedsEndDate(meeting)) {
    if (!meeting.endDate || !meetingEndDateValid(meeting)) return false;
  }
  return true;
}

/** Name is required; any opened meeting must be fully filled. */
export function isCourseFormValid(values: CourseFormValues): boolean {
  if (values.name.trim() === "") return false;
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
 * A recurring meeting's end date must land on the same weekday it starts on
 * (so the series lands on it) and not precede the start. "once" meetings and
 * open-ended ones need no end date, so they're always valid.
 */
export function meetingEndDateValid(meeting: MeetingValues): boolean {
  if (meeting.frequency === "once" || meeting.noEndDate) return true;
  if (!meeting.endDate || !meeting.startDate) return true;
  if (hebrewDayOf(meeting.endDate) !== hebrewDayOf(meeting.startDate)) {
    return false;
  }
  return meeting.endDate >= meeting.startDate;
}

export function meetingNeedsEndDate(meeting: MeetingValues): boolean {
  return meeting.frequency !== "once" && !meeting.noEndDate;
}

// NOTE: there is deliberately no `equipmentAvailableNow(item)` here any more. How
// many units are free is not a property of the item — it depends on WHEN the
// activity meets and who else holds the item then. That is computed for real by
// `equipmentDemands` in lib/equipment-conflicts.ts and threaded into the form as
// the `available` prop per equipment line.

export function equipmentByName(
  name: string,
  items: Equipment[],
): Equipment | undefined {
  return items.find((e) => e.name === name);
}

/**
 * The equipment names a given line may still choose: every item minus the ones
 * already picked by the OTHER lines (its own current pick stays visible). Used
 * so each physical item can be added to an activity only once.
 */
export function availableEquipmentOptions(
  lines: { id: string; equipmentId: string }[],
  currentLineId: string,
  items: Equipment[],
): string[] {
  const takenByOthers = new Set(
    lines
      .filter((l) => l.id !== currentLineId && l.equipmentId)
      .map((l) => l.equipmentId),
  );
  return items.map((e) => e.name).filter((name) => !takenByOthers.has(name));
}

/** Whether a student falls within the course's age and rating ranges. */
export function meetsCriteria(player: Player, values: CourseFormValues): boolean {
  const ageMin = values.ageMin ? Number(values.ageMin) : null;
  const ageMax = values.ageMax ? Number(values.ageMax) : null;
  const fitMin = values.ratingMin ? Number(values.ratingMin) : null;
  const fitMax = values.ratingMax ? Number(values.ratingMax) : null;

  if (ageMin != null && player.age < ageMin) return false;
  if (ageMax != null && player.age > ageMax) return false;
  if (fitMin != null && player.israeliRating < fitMin) return false;
  if (fitMax != null && player.israeliRating > fitMax) return false;
  return true;
}
