import { players } from "@/lib/players-data";
import type { Tournament } from "@/lib/tournaments-data";
import {
  daysFromSessions,
  hebrewDayFromIso,
  type SessionDoc,
} from "@/lib/sessions-data";
import type { RelationDoc } from "@/lib/relations-data";
import {
  addWeeks,
  makeRound,
  type EquipmentLineValues,
  type MeetingValues,
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


/**
 * One round per the tournament's round count, all in its room, a week apart
 * starting from the next date.
 *
 * A finished tournament (or any without a scheduled next date) has `nextDate`
 * "—", which yields no ISO date. We fall back to today so the reconstructed
 * rounds are still complete — otherwise the edit form would be permanently
 * invalid (empty round dates) and "עדכון" could never enable.
 */
function roundsFor(tournament: Tournament): RoundValues[] {
  const { start, end } = timeWindow(tournament);
  const firstDate =
    isoFromNextDate(tournament.nextDate) || new Date().toISOString().slice(0, 10);
  return Array.from({ length: tournament.rounds }, (_, i) => ({
    ...makeRound(),
    id: `round-${tournament.id}-${i}`,
    room: tournament.room,
    startTime: start,
    endTime: end,
    date: addWeeks(firstDate, i),
  }));
}

/** The players already registered to this tournament. */
function playerIdsFor(tournament: Tournament): string[] {
  return players
    .filter((p) => p.tournaments.includes(tournament.name))
    .map((p) => p.id);
}

/** "2026-06-07" → "07.06.2026"; invalid → "—". */
function nextDateFromIso(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "—";
}

/** Deterministic id for a tournament's Nth slot (matches the seed/replace scheme). */
function slotId(parentId: string, index: number): string {
  return `${parentId}__meeting__${index}`.replace(/\//g, "／");
}

/**
 * The tournament's scheduled slots (sessions) derived from the form: one dated
 * session per round, or a single recurring session for the "fixed" format.
 */
export function tournamentSessionsFromForm(
  id: string,
  values: TournamentFormValues,
): SessionDoc[] {
  if (values.format === "fixed") {
    return values.fixedMeetings.map((m, i) => ({
      id: slotId(id, i),
      parentType: "tournament",
      parentId: id,
      date: m.startDate,
      start: m.startTime,
      end: m.endTime,
      roomId: m.room,
      day: hebrewDayFromIso(m.startDate) || undefined,
      frequency: m.frequency,
      noEndDate: m.noEndDate,
      endDate: m.noEndDate ? "" : m.endDate,
    }));
  }
  return values.rounds.map((round, i) => ({
    id: slotId(id, i),
    parentType: "tournament",
    parentId: id,
    date: round.date,
    start: round.startTime,
    end: round.endTime,
    roomId: round.room,
    day: hebrewDayFromIso(round.date) || undefined,
  }));
}

/** The scalar tournament fields to persist, derived from the form + its slots. */
function tournamentScalarsFromForm(values: TournamentFormValues) {
  const id = values.name.trim();
  const sessions = tournamentSessionsFromForm(id, values);
  const dates = sessions.map((s) => s.date).filter(Boolean).sort();
  return {
    name: id,
    judge: values.judge,
    rounds:
      values.format === "rounds"
        ? values.rounds.length
        : values.fixedMeetings.length,
    days: daysFromSessions(sessions),
    nextDate: dates.length ? nextDateFromIso(dates[0]) : "—",
    ratingMin: Number(values.ratingMin) || 0,
    ratingMax: Number(values.ratingMax) || 0,
    ageMin: Number(values.ageMin) || 0,
    ageMax: Number(values.ageMax) || 0,
    noAgeLimit: values.noAgeLimit,
    noRatingLimit: values.noRatingLimit,
    room: sessions[0]?.roomId ?? "",
    notes: values.notes,
  };
}

/** A full new-tournament document (participant count is projected on read). */
export function tournamentRecordFromForm(
  values: TournamentFormValues,
): Omit<Tournament, "id"> {
  return {
    ...tournamentScalarsFromForm(values),
    participants: values.playerIds.length,
    status: "מתוכננת",
  };
}

/** The patch applied when editing a tournament (derived counts projected on read). */
export function tournamentEditPatch(
  values: TournamentFormValues,
): Partial<Tournament> {
  return tournamentScalarsFromForm(values);
}

/** Rebuild a form round from a stored dated session (edit prefill). */
function roundFromSession(session: SessionDoc): RoundValues {
  return {
    ...makeRound(),
    id: session.id,
    room: session.roomId,
    startTime: session.start,
    endTime: session.end,
    date: session.date,
  };
}

/** Rebuild a fixed meeting from a stored recurring session (edit prefill). */
function fixedMeetingFromSession(session: SessionDoc): MeetingValues {
  return {
    id: session.id,
    startDate: session.date,
    room: session.roomId,
    startTime: session.start,
    endTime: session.end,
    frequency: session.frequency ?? "weekly",
    noEndDate: session.noEndDate ?? false,
    endDate: session.endDate ?? "",
  };
}

/**
 * Builds the "edit tournament" form from LIVE Firestore data: rounds come from
 * the tournament's `sessions`, enrolled players and equipment from its
 * `relations`. This is the tournaments-page path; the mock-derived
 * {@link tournamentFormValuesFor} stays for modules not yet migrated.
 */
export function tournamentFormValuesFromLive(
  tournament: Tournament,
  sessions: SessionDoc[],
  relations: RelationDoc[],
): TournamentFormValues {
  const slots = sessions.filter((s) => s.parentId === tournament.id);
  const recurringSlots = slots.filter((s) => s.frequency);
  const playerIds = relations
    .filter((r) => r.kind === "player_tournament" && r.targetId === tournament.id)
    .map((r) => r.subjectId);
  const equipmentLines: EquipmentLineValues[] = relations
    .filter(
      (r) => r.kind === "equipment_tournament" && r.targetId === tournament.id,
    )
    .map((r, i) => ({
      id: `equip-${tournament.id}-${i}`,
      equipmentId: r.subjectId,
      quantity: r.quantity != null ? String(r.quantity) : "1",
    }));

  if (recurringSlots.length > 0) {
    return {
      ...tournamentFormValuesFor(tournament),
      id: tournament.id,
      playerIds,
      equipment: equipmentLines,
      format: "fixed",
      roundsCount: "",
      rounds: [],
      fixedMeetings: recurringSlots.map(fixedMeetingFromSession),
    };
  }

  const rounds = slots.map(roundFromSession);
  return {
    ...tournamentFormValuesFor(tournament),
    id: tournament.id,
    playerIds,
    equipment: equipmentLines,
    format: "rounds",
    roundsCount: rounds.length ? String(rounds.length) : "",
    rounds: rounds.length ? rounds : tournamentFormValuesFor(tournament).rounds,
  };
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
    id: tournament.id,
    name: tournament.name,
    judge: tournament.judge,
    // A blank/zero bound is "no limit" — show it as an empty field, not "0".
    ratingMin: tournament.ratingMin ? String(tournament.ratingMin) : "",
    ratingMax: tournament.ratingMax ? String(tournament.ratingMax) : "",
    ageMin: tournament.ageMin ? String(tournament.ageMin) : "",
    ageMax: tournament.ageMax ? String(tournament.ageMax) : "",
    noAgeLimit: tournament.noAgeLimit ?? false,
    noRatingLimit: tournament.noRatingLimit ?? false,
    notes: tournament.notes ?? "",
    format: "rounds",
    roundsCount: String(rounds.length),
    rounds,
    fixedMeetings: [],
    playerIds: playerIdsFor(tournament),
    equipment: [],
  };
}
