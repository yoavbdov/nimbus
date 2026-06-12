import { players } from "@/lib/players-data";
import { rooms, equipment } from "@/lib/rooms-data";
import type { Tournament } from "@/lib/tournaments-data";
import {
  addWeeks,
  makeRound,
  type EquipmentLineValues,
  type RoundValues,
  type TournamentFormValues,
} from "@/lib/tournament-form";

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

/** A deterministic afternoon time window for a tournament's rounds. */
function timeWindow(tournament: Tournament): { start: string; end: string } {
  const startHour = 14 + (hash(tournament.id, 5381) % 5); // 14:00–18:00
  const duration = 1 + (hash(tournament.id, 131) % 2); // 1–2 hours
  return { start: `${pad(startHour)}:00`, end: `${pad(startHour + duration)}:00` };
}

/** Built-from-data notes so every tournament shows something in its details. */
function notesFor(tournament: Tournament): string {
  const judgeLine = tournament.judge
    ? `התחרות נשפטת על ידי ${tournament.judge}.`
    : "טרם שובץ שופט לתחרות.";
  return `${judgeLine} ${tournament.rounds} סיבובים בחדר ${tournament.room}. מיועדת למד כושר ${tournament.ratingMin}–${tournament.ratingMax}.`;
}

/**
 * One round per the tournament's round count, all in its room, a week apart
 * starting from the next date.
 */
function roundsFor(tournament: Tournament): RoundValues[] {
  const { start, end } = timeWindow(tournament);
  const firstDate = isoFromNextDate(tournament.nextDate);
  return Array.from({ length: tournament.rounds }, (_, i) => ({
    ...makeRound(),
    id: `round-${tournament.id}-${i}`,
    room: tournament.room,
    startTime: start,
    endTime: end,
    date: firstDate ? addWeeks(firstDate, i) : "",
  }));
}

/** The players already registered to this tournament. */
function playerIdsFor(tournament: Tournament): string[] {
  return players
    .filter((p) => p.tournaments.includes(tournament.name))
    .map((p) => p.id);
}

/** Equipment lines derived from the gear that lives in the tournament's room. */
function equipmentFor(tournament: Tournament): EquipmentLineValues[] {
  const room = rooms.find((r) => r.name === tournament.room);
  if (!room) return [];
  const lines: EquipmentLineValues[] = [];
  room.equipment.forEach((name, i) => {
    const match = equipment.find(
      (e) => e.name.includes(name) || name.includes(e.name),
    );
    if (match && !lines.some((l) => l.equipmentId === match.name)) {
      lines.push({
        id: `equip-${tournament.id}-${i}`,
        equipmentId: match.name,
        quantity: String(1 + (hash(match.id, 7) % 3)),
      });
    }
  });
  return lines;
}

/**
 * Builds the full "edit tournament" form from an existing tournament. The
 * roster only stores a slice of these fields, so the rest (rounds, players,
 * equipment, notes) is derived consistently from the tournament.
 */
export function tournamentFormValuesFor(
  tournament: Tournament,
): TournamentFormValues {
  const rounds = roundsFor(tournament);
  return {
    name: tournament.name,
    judge: tournament.judge,
    fitnessMin: String(tournament.ratingMin),
    fitnessMax: String(tournament.ratingMax),
    ageMin: "",
    ageMax: "",
    notes: notesFor(tournament),
    format: "rounds",
    roundsCount: String(rounds.length),
    rounds,
    fixedStartDate: "",
    fixedHasEndDate: false,
    fixedEndDate: "",
    fixedRoom: "",
    fixedStartTime: "",
    fixedEndTime: "",
    fixedFrequency: "weekly",
    playerIds: playerIdsFor(tournament),
    equipment: equipmentFor(tournament),
  };
}
