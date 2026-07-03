import { rooms, equipment } from "@/lib/rooms-data";
import type { ClubEvent } from "@/lib/events-data";
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
