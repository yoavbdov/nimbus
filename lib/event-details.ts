import type { ClubEvent } from "@/lib/events-data";
import {
  daysFromSessions,
  hebrewDayFromIso,
  type SessionDoc,
} from "@/lib/sessions-data";
import type { RelationDoc } from "@/lib/relations-data";
import {
  EMPTY_EVENT_FORM,
  type EquipmentLineValues,
  type EventFormValues,
} from "@/lib/event-form";

/** "2026-06-07" → "07.06.2026"; invalid → "—". */
function nextDateFromIso(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "—";
}

/** Deterministic id for an event's Nth slot (matches the seed/replace scheme). */
function slotId(parentId: string, index: number): string {
  return `${parentId}__meeting__${index}`.replace(/\//g, "／");
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

/** The event's own stored fields, with the schedule left for the caller to fill
 * from its `sessions`. */
function eventScalarValues(event: ClubEvent): EventFormValues {
  return {
    ...EMPTY_EVENT_FORM,
    id: event.id,
    name: event.name,
    notes: event.notes ?? "",
    format: event.recurrence === "חד פעמי" ? "oneoff" : "recurring",
  };
}

/**
 * Builds the "edit event" form from LIVE Firestore data: the slot times come
 * from the event's `sessions`, enrolled players and equipment from its
 * `relations`. This is the ONLY way to prefill the edit form — every screen goes
 * through it, so no two screens can disagree about what an event holds.
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

  const base = eventScalarValues(event);
  // An event with no stored slot opens with an empty schedule — that is the
  // truth, and inventing times here is what made screens disagree.
  if (!slot) {
    return { ...base, playerIds, equipment: equipmentLines };
  }
  const recurring = Boolean(slot.frequency);
  return {
    ...base,
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

