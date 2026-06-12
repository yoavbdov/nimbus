import {
  makeEquipmentLine,
  type EquipmentLineValues,
} from "@/lib/activity-form";
import {
  TOURNAMENT_FREQUENCY_OPTIONS,
  type TournamentFrequency,
} from "@/lib/tournament-form";

export { makeEquipmentLine, type EquipmentLineValues };

/**
 * How often a recurring event repeats. Events reuse the same cadence options as
 * fixed tournaments, so the dropdown stays consistent across the app.
 */
export type EventFrequency = TournamentFrequency;
export const EVENT_FREQUENCY_OPTIONS = TOURNAMENT_FREQUENCY_OPTIONS;

/**
 * An event is either a single "one-off" happening (one date with a time window
 * and room) or a "recurring" event with a start date, a cadence and an optional
 * end date.
 */
export type EventFormat = "oneoff" | "recurring";

/** Shape of the "add event" form. Empty strings = not filled yet. */
export interface EventFormValues {
  name: string;
  notes: string;
  format: EventFormat;
  /** One-off fields. */
  oneoffRoom: string;
  oneoffDate: string;
  oneoffStartTime: string;
  oneoffEndTime: string;
  /** Recurring fields. */
  recurringRoom: string;
  recurringFrequency: EventFrequency;
  recurringStartTime: string;
  recurringEndTime: string;
  recurringStartDate: string;
  /** When false the end-date field is disabled (grayed out). */
  recurringHasEndDate: boolean;
  recurringEndDate: string;
  playerIds: string[];
  equipment: EquipmentLineValues[];
}

export const EMPTY_EVENT_FORM: EventFormValues = {
  name: "",
  notes: "",
  format: "oneoff",
  oneoffRoom: "",
  oneoffDate: "",
  oneoffStartTime: "",
  oneoffEndTime: "",
  recurringRoom: "",
  recurringFrequency: "weekly",
  recurringStartTime: "",
  recurringEndTime: "",
  recurringStartDate: "",
  recurringHasEndDate: false,
  recurringEndDate: "",
  playerIds: [],
  equipment: [],
};

/**
 * Name is required. A one-off event needs a room, date and time window; a
 * recurring event needs a room, start date and time window (plus an end date
 * once the end-date option is enabled).
 */
export function isEventFormValid(values: EventFormValues): boolean {
  if (values.name.trim() === "") return false;
  if (values.format === "oneoff") {
    return Boolean(
      values.oneoffRoom &&
        values.oneoffDate &&
        values.oneoffStartTime &&
        values.oneoffEndTime,
    );
  }
  if (
    !values.recurringRoom ||
    !values.recurringStartDate ||
    !values.recurringStartTime ||
    !values.recurringEndTime
  ) {
    return false;
  }
  if (values.recurringHasEndDate && !values.recurringEndDate) return false;
  return true;
}
