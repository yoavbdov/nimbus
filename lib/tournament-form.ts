import { allActivityCoaches } from "@/lib/activities-data";
import {
  makeEquipmentLine,
  type EquipmentLineValues,
} from "@/lib/activity-form";
import type { Player } from "@/lib/players-data";

export { makeEquipmentLine, type EquipmentLineValues };

/** The judge dropdown reuses the same coach list as the activities modal. */
export const allTournamentJudgeOptions = allActivityCoaches;

/**
 * A tournament is either split into discrete rounds (each with its own room,
 * time window and date) or a single "fixed" event with a start date and an
 * optional end date.
 */
export type TournamentFormat = "rounds" | "fixed";

/** How often a fixed tournament repeats. */
export type TournamentFrequency =
  | "weekly"
  | "biweekly"
  | "triweekly"
  | "monthly";

export const TOURNAMENT_FREQUENCY_OPTIONS: {
  value: TournamentFrequency;
  label: string;
}[] = [
  { value: "weekly", label: "פעם בשבוע" },
  { value: "biweekly", label: "פעם בשבועיים" },
  { value: "triweekly", label: "פעם בשלושה שבועות" },
  { value: "monthly", label: "פעם בחודש" },
];

/** A single round: a room + time window on a specific date. */
export interface RoundValues {
  id: string;
  room: string;
  startTime: string;
  endTime: string;
  date: string;
}

/** Shape of the "add tournament" form. Empty strings = not filled yet. */
export interface TournamentFormValues {
  name: string;
  judge: string;
  fitnessMin: string;
  fitnessMax: string;
  ageMin: string;
  ageMax: string;
  notes: string;
  format: TournamentFormat;
  /** Numeric string controlling how many round cards exist. */
  roundsCount: string;
  rounds: RoundValues[];
  fixedStartDate: string;
  /** When false the end-date field is disabled (grayed out). */
  fixedHasEndDate: boolean;
  fixedEndDate: string;
  fixedRoom: string;
  fixedStartTime: string;
  fixedEndTime: string;
  fixedFrequency: TournamentFrequency;
  playerIds: string[];
  equipment: EquipmentLineValues[];
}

export const EMPTY_TOURNAMENT_FORM: TournamentFormValues = {
  name: "",
  judge: "",
  fitnessMin: "",
  fitnessMax: "",
  ageMin: "",
  ageMax: "",
  notes: "",
  format: "rounds",
  roundsCount: "",
  rounds: [],
  fixedStartDate: "",
  fixedHasEndDate: false,
  fixedEndDate: "",
  fixedRoom: "",
  fixedStartTime: "",
  fixedEndTime: "",
  fixedFrequency: "weekly",
  playerIds: [],
  equipment: [],
};

let idCounter = 0;
function makeId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export function makeRound(): RoundValues {
  return { id: makeId("round"), room: "", startTime: "", endTime: "", date: "" };
}

/** A round must have every field filled to count as complete. */
export function roundComplete(round: RoundValues): boolean {
  return Boolean(round.room && round.startTime && round.endTime && round.date);
}

/** Adds whole weeks to an ISO date string (yyyy-mm-dd), returning ISO. */
export function addWeeks(iso: string, weeks: number): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + weeks * 7);
  return date.toISOString().slice(0, 10);
}

/**
 * The "magic" autocomplete: from a base round index, fill every later round
 * with the base round's room and times, and a date one week after the previous
 * round. Rounds before the base are left untouched.
 */
export function completeRoundsFrom(
  rounds: RoundValues[],
  baseIndex: number,
): RoundValues[] {
  const base = rounds[baseIndex];
  if (!base) return rounds;
  return rounds.map((round, i) => {
    if (i <= baseIndex) return round;
    return {
      ...round,
      room: base.room,
      startTime: base.startTime,
      endTime: base.endTime,
      date: addWeeks(base.date, i - baseIndex),
    };
  });
}

/**
 * Name is required. For a rounds tournament every opened round must be fully
 * filled; for a fixed tournament a start date is required (plus an end date
 * once the end-date option is enabled).
 */
export function isTournamentFormValid(values: TournamentFormValues): boolean {
  if (values.name.trim() === "") return false;
  if (values.format === "rounds") {
    if (values.rounds.length === 0) return false;
    return values.rounds.every(roundComplete);
  }
  if (!values.fixedStartDate) return false;
  if (!values.fixedRoom || !values.fixedStartTime || !values.fixedEndTime) {
    return false;
  }
  if (values.fixedHasEndDate && !values.fixedEndDate) return false;
  return true;
}

/** Whether a player falls within the tournament's age and fitness ranges. */
export function meetsTournamentCriteria(
  player: Player,
  values: TournamentFormValues,
): boolean {
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
