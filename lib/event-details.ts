import { rooms, equipment } from "@/lib/rooms-data";
import { COURSE_DAYS, type CourseDay } from "@/lib/courses-data";
import type { ClubEvent } from "@/lib/events-data";
import type { SessionDoc } from "@/lib/sessions-data";
import type { RelationDoc } from "@/lib/relations-data";
import {
  EMPTY_EVENT_FORM,
  type EquipmentLineValues,
  type EventFormValues,
} from "@/lib/event-form";

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

/** A deterministic afternoon/evening time window for an event. */
function timeWindow(event: ClubEvent): { start: string; end: string } {
  const startHour = 16 + (hash(event.id, 5381) % 4); // 16:00–19:00
  const duration = 1 + (hash(event.id, 131) % 3); // 1–3 hours
  return { start: `${pad(startHour)}:00`, end: `${pad(startHour + duration)}:00` };
}


/** Equipment lines derived from the gear that lives in the event's room. */
function equipmentFor(event: ClubEvent): EquipmentLineValues[] {
  const room = rooms.find((r) => r.name === event.room);
  if (!room) return [];
  const lines: EquipmentLineValues[] = [];
  room.equipment.forEach((name, i) => {
    const match = equipment.find(
      (e) => e.name.includes(name) || name.includes(e.name),
    );
    if (match && !lines.some((l) => l.equipmentId === match.name)) {
      lines.push({
        id: `equip-${event.id}-${i}`,
        equipmentId: match.name,
        quantity: String(1 + (hash(match.id, 7) % 3)),
      });
    }
  });
  return lines;
}

/** "2026-06-07" → "07.06.2026"; invalid → "—". */
function nextDateFromIso(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "—";
}

const HEBREW_DAY_BY_JS: CourseDay[] = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
];

/** The Hebrew weekday of an ISO date ("2026-07-01" → "שלישי"); "" when invalid. */
function hebrewDayFromIso(iso: string): CourseDay | "" {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : HEBREW_DAY_BY_JS[date.getDay()];
}

/** Deterministic id for an event's Nth slot (matches the seed/replace scheme). */
function slotId(parentId: string, index: number): string {
  return `${parentId}__slot__${index}`.replace(/\//g, "／");
}

/**
 * The event's scheduled slots (sessions) derived from the form: a single dated
 * session for a one-off event, or a single recurring session for a recurring
 * event.
 */
export function eventSessionsFromForm(
  id: string,
  values: EventFormValues,
): SessionDoc[] {
  if (values.format === "oneoff") {
    return [
      {
        id: slotId(id, 0),
        parentType: "event",
        parentId: id,
        date: values.oneoffDate,
        start: values.oneoffStartTime,
        end: values.oneoffEndTime,
        roomId: values.oneoffRoom,
        day: hebrewDayFromIso(values.oneoffDate) || undefined,
      },
    ];
  }
  return [
    {
      id: slotId(id, 0),
      parentType: "event",
      parentId: id,
      date: values.recurringStartDate,
      start: values.recurringStartTime,
      end: values.recurringEndTime,
      roomId: values.recurringRoom,
      day: hebrewDayFromIso(values.recurringStartDate) || undefined,
      frequency: values.recurringFrequency,
      noEndDate: !values.recurringHasEndDate,
      endDate: values.recurringHasEndDate ? values.recurringEndDate : "",
    },
  ];
}

/** The distinct weekdays the event's slots run on, in week order. */
function daysFromSessions(sessions: SessionDoc[]): CourseDay[] {
  const set = new Set(sessions.map((s) => s.day).filter(Boolean));
  return COURSE_DAYS.filter((d) => set.has(d));
}

/** The scalar event fields to persist, derived from the form + its slots. */
function eventScalarsFromForm(values: EventFormValues) {
  const id = values.name.trim();
  const sessions = eventSessionsFromForm(id, values);
  const dates = sessions.map((s) => s.date).filter(Boolean).sort();
  return {
    name: id,
    days: daysFromSessions(sessions),
    nextDate: dates.length ? nextDateFromIso(dates[0]) : "—",
    recurrence: (values.format === "oneoff" ? "חד פעמי" : "קבוע") as
      | "חד פעמי"
      | "קבוע",
    room: sessions[0]?.roomId ?? "",
    notes: values.notes,
  };
}

/** A full new-event document. */
export function eventRecordFromForm(values: EventFormValues): Omit<ClubEvent, "id"> {
  return {
    ...eventScalarsFromForm(values),
    status: "מתוכנן",
  };
}

/** The patch applied when editing an event. */
export function eventEditPatch(values: EventFormValues): Partial<ClubEvent> {
  return eventScalarsFromForm(values);
}

/**
 * Builds the "edit event" form from LIVE Firestore data: the slot times come
 * from the event's `sessions`, enrolled players and equipment from its
 * `relations`. This is the events-page path; the mock-derived
 * {@link eventFormValuesFor} stays for modules not yet migrated.
 */
export function eventFormValuesFromLive(
  event: ClubEvent,
  sessions: SessionDoc[],
  relations: RelationDoc[],
): EventFormValues {
  const slot = sessions.find((s) => s.parentId === event.id);
  const playerIds = relations
    .filter((r) => r.kind === "player_event" && r.targetId === event.id)
    .map((r) => r.subjectId);
  const equipmentLines: EquipmentLineValues[] = relations
    .filter((r) => r.kind === "equipment_event" && r.targetId === event.id)
    .map((r, i) => ({
      id: `equip-${event.id}-${i}`,
      equipmentId: r.subjectId,
      quantity: r.quantity != null ? String(r.quantity) : "1",
    }));

  const base = eventFormValuesFor(event);
  if (!slot) {
    return { ...base, id: event.id, playerIds, equipment: equipmentLines };
  }
  const recurring = Boolean(slot.frequency);
  return {
    ...base,
    id: event.id,
    playerIds,
    equipment: equipmentLines,
    format: recurring ? "recurring" : "oneoff",
    oneoffRoom: recurring ? "" : slot.roomId,
    oneoffDate: recurring ? "" : slot.date,
    oneoffStartTime: recurring ? "" : slot.start,
    oneoffEndTime: recurring ? "" : slot.end,
    recurringRoom: recurring ? slot.roomId : "",
    recurringStartDate: recurring ? slot.date : "",
    recurringStartTime: recurring ? slot.start : "",
    recurringEndTime: recurring ? slot.end : "",
    recurringFrequency:
      slot.frequency && slot.frequency !== "once" ? slot.frequency : "weekly",
    recurringHasEndDate: recurring ? !slot.noEndDate : false,
    recurringEndDate: recurring ? (slot.endDate ?? "") : "",
  };
}

/**
 * Builds the full "edit event" form from an existing event. The roster only
 * stores a slice of these fields, so the rest (times, notes, equipment) is
 * derived consistently from the event.
 */
export function eventFormValuesFor(event: ClubEvent): EventFormValues {
  const { start, end } = timeWindow(event);
  const date = isoFromNextDate(event.nextDate);
  const equipmentLines = equipmentFor(event);
  const oneoff = event.recurrence === "חד פעמי";

  return {
    ...EMPTY_EVENT_FORM,
    id: event.id,
    name: event.name,
    notes: event.notes ?? "",
    format: oneoff ? "oneoff" : "recurring",
    oneoffRoom: oneoff ? event.room : "",
    oneoffDate: oneoff ? date : "",
    oneoffStartTime: oneoff ? start : "",
    oneoffEndTime: oneoff ? end : "",
    recurringRoom: oneoff ? "" : event.room,
    recurringStartTime: oneoff ? "" : start,
    recurringEndTime: oneoff ? "" : end,
    recurringStartDate: oneoff ? "" : date,
    equipment: equipmentLines,
  };
}
