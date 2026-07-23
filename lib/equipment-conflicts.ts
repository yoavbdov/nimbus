/**
 * Pure equipment-shortage detection — never talks to Firestore (the live reads
 * live in `hooks/schedule/useEquipmentConflicts.ts`).
 *
 * Equipment is the one COUNTED resource: a room, a coach and a player are each
 * taken or free, but 30 chess clocks can be split between activities. So the
 * rule is not "two overlapping activities share an item" — it is "at some
 * instant, the quantities held add up to more than the club owns".
 *
 * That makes a naive sum wrong. With 30 clocks and A 16:00–17:00 (20),
 * B 16:30–17:30 (10), C 17:15–18:00 (10), a draft overlapping all three would
 * "sum" to 40 — yet no single instant ever needs more than 30, because A and C
 * never coexist. Hence a proper sweep: every day the draft holds the item is cut
 * into elementary segments at the activities' start/end times, and the demand is
 * summed per segment. Only segments the DRAFT itself needs the item for are
 * considered — a shortage between two other activities is not this modal's news.
 *
 * Everything is expressed through ONE number, `available` = what the club owns
 * minus the most any other activities hold at once while the draft meets. The
 * draft fits iff it asks for no more than that, so the per-line hint and the
 * warning banner can never disagree.
 *
 * An activity's quantity is allocated once, per activity, not per meeting (see
 * `relations.quantity`), so two overlapping meetings of the same activity still
 * count its quantity once.
 *
 * A shortage is a WARNING, never a block — including the degenerate case of an
 * activity asking for more than the club owns with nothing else scheduled.
 */
import { type EventCategory } from "@/lib/schedule-data";
import { hebrewDayFromIso, type SessionDoc } from "@/lib/sessions-data";
import { occurrencesInRange } from "@/lib/schedule-events";

/** A half-open [start,end) window within one day, as "HH:mm" (which sorts). */
interface Interval {
  start: string;
  end: string;
}

/** One activity's allocation of one item. */
export interface EquipmentClaim {
  /** The holding activity's id (= its display name). */
  parentId: string;
  title: string;
  category: EventCategory;
  /** How many units it holds, for every meeting it runs. */
  quantity: number;
}

/** A claim at a concrete moment, carrying the meeting window it holds it for. */
export interface EquipmentHolder extends EquipmentClaim {
  /** The holder's own meeting window on that date (HH:mm), for display. */
  start: string;
  end: string;
}

/** What one item looks like for the draft: how many it can have, and when not. */
export interface EquipmentDemand {
  /** The item's id (= its display name). */
  equipmentId: string;
  /** How many the club owns. */
  total: number;
  /** How many the draft is asking for. */
  requested: number;
  /**
   * Units the draft can actually have: `total` minus the most other activities
   * hold at any single moment the draft needs the item.
   */
  available: number;
  /** `total - available` — the most others hold at once. */
  heldByOthers: number;
  /** `requested - available`; zero or less means it fits. */
  missing: number;
  /**
   * The tightest moment — where `heldByOthers` is reached, earliest first.
   * `null` when the draft has no dated meetings yet, so nothing can be placed
   * in time and only the ask itself can be judged.
   */
  at: { date: string; day: string; start: string; end: string } | null;
  /** The other activities holding the item at that moment, with their hours. */
  holders: EquipmentHolder[];
  /** Distinct dates a shortage occurs on within the window. */
  count: number;
  /** Whether the shortage recurs (more than one date). */
  recurring: boolean;
}

/** Sorts and merges overlapping/adjacent windows into a disjoint cover. */
function mergeIntervals(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].sort((a, b) => a.start.localeCompare(b.start));
  const merged: Interval[] = [];
  for (const interval of sorted) {
    const last = merged[merged.length - 1];
    if (last && interval.start <= last.end) {
      if (interval.end > last.end) last.end = interval.end;
    } else {
      merged.push({ ...interval });
    }
  }
  return merged;
}

/**
 * When an activity holds its equipment: each date in the window mapped to the
 * disjoint windows it meets on. Merging is what makes one activity's quantity
 * count once even when two of its own meetings overlap.
 */
function windowsByDate(
  sessions: SessionDoc[],
  rangeStart: string,
  rangeEnd: string,
): Map<string, Interval[]> {
  const byDate = new Map<string, Interval[]>();
  for (const session of sessions) {
    if (!session.date || !session.start || !session.end) continue; // half-filled
    if (session.start >= session.end) continue; // a zero or inverted window
    for (const date of occurrencesInRange(session, rangeStart, rangeEnd)) {
      const list = byDate.get(date);
      if (list) list.push({ start: session.start, end: session.end });
      else byDate.set(date, [{ start: session.start, end: session.end }]);
    }
  }
  for (const [date, list] of byDate) byDate.set(date, mergeIntervals(list));
  return byDate;
}

/** Whether any of a day's disjoint windows spans the whole segment [from,to). */
function covers(intervals: Interval[], from: string, to: string): boolean {
  return intervals.some((i) => i.start <= from && i.end >= to);
}

/** The tightest moment on one date: where others hold the most units at once. */
function tightestMomentOnDate(
  draftWindows: Interval[],
  claimWindows: { claim: EquipmentClaim; windows: Interval[] }[],
  requested: number,
  total: number,
): {
  heldByOthers: number;
  start: string;
  end: string;
  holders: EquipmentHolder[];
  /** Whether any moment on this date leaves the draft short. */
  short: boolean;
} | null {
  // Cut the day at every start/end, so within a segment nobody joins or leaves.
  const points = new Set<string>();
  for (const { start, end } of draftWindows) {
    points.add(start);
    points.add(end);
  }
  for (const { windows } of claimWindows)
    for (const { start, end } of windows) {
      points.add(start);
      points.add(end);
    }
  const boundaries = [...points].sort((a, b) => a.localeCompare(b));

  let tightest: {
    heldByOthers: number;
    start: string;
    end: string;
    holders: EquipmentHolder[];
    short: boolean;
  } | null = null;
  let short = false;

  for (let i = 0; i < boundaries.length - 1; i++) {
    const from = boundaries[i];
    const to = boundaries[i + 1];
    // Only moments the draft itself needs the item are this draft's problem.
    if (!covers(draftWindows, from, to)) continue;

    // Keep the holder's OWN window, not the segment — the details dialog shows
    // "טורניר שחמט — 14:00–16:00 — 6", i.e. when that activity actually meets.
    const holders = claimWindows
      .map(({ claim, windows }) => {
        const held = windows.find((w) => w.start <= from && w.end >= to);
        return held ? { ...claim, start: held.start, end: held.end } : null;
      })
      .filter((h): h is EquipmentHolder => h !== null);
    const heldByOthers = holders.reduce((sum, c) => sum + c.quantity, 0);
    if (requested + heldByOthers > total) short = true;
    // Strictly greater keeps the EARLIEST of equally tight moments.
    if (!tightest || heldByOthers > tightest.heldByOthers)
      tightest = { heldByOthers, start: from, end: to, holders, short: false };
  }

  return tightest ? { ...tightest, short } : null;
}

/**
 * How every item the draft asks for stands: what's available to it, and where it
 * falls short. One entry per requested item, shortage or not — the caller shows
 * the availability per line and filters `missing > 0` for the warning banner.
 *
 * `inventoryOf` gives what the club owns (`undefined` for an unknown item, which
 * is skipped) and `claimsOf` the persisted allocations of that item — the caller
 * must exclude the edited activity's own allocation, and archived activities,
 * from it. `sessionsOf` gives a holding activity's meetings.
 *
 * Duplicate draft lines for one item are summed, so two lines of 8 read as 16.
 */
export function equipmentDemands(
  draftLines: { equipmentId: string; quantity: string }[],
  draftSessions: SessionDoc[],
  inventoryOf: (equipmentId: string) => number | undefined,
  claimsOf: (equipmentId: string) => EquipmentClaim[],
  sessionsOf: (parentId: string) => SessionDoc[],
  rangeStart: string,
  rangeEnd: string,
): EquipmentDemand[] {
  // The draft's own ask per item, summed across its lines. A line with no
  // quantity typed yet still counts as a 0 ask, so its availability can show.
  const requestedByItem = new Map<string, number>();
  for (const line of draftLines) {
    if (!line.equipmentId) continue;
    const quantity = Number(line.quantity);
    const ask = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
    requestedByItem.set(
      line.equipmentId,
      (requestedByItem.get(line.equipmentId) ?? 0) + ask,
    );
  }
  if (requestedByItem.size === 0) return [];

  const draftWindowsByDate = windowsByDate(draftSessions, rangeStart, rangeEnd);
  // One activity can hold several items, so its dates are worth computing once.
  const holderWindows = new Map<string, Map<string, Interval[]>>();
  const windowsOf = (parentId: string) => {
    const known = holderWindows.get(parentId);
    if (known) return known;
    const built = windowsByDate(sessionsOf(parentId), rangeStart, rangeEnd);
    holderWindows.set(parentId, built);
    return built;
  };

  const demands: EquipmentDemand[] = [];

  for (const [equipmentId, requested] of requestedByItem) {
    const total = inventoryOf(equipmentId);
    if (total === undefined) continue; // an item that no longer exists

    // No dated meetings yet: nothing can be placed in time, so the whole
    // inventory is nominally available and only the ask itself can be judged.
    if (draftWindowsByDate.size === 0) {
      demands.push({
        equipmentId,
        total,
        requested,
        available: total,
        heldByOthers: 0,
        missing: requested - total,
        at: null,
        holders: [],
        count: 0,
        recurring: false,
      });
      continue;
    }

    const claims = claimsOf(equipmentId);
    let tightest: {
      date: string;
      start: string;
      end: string;
      heldByOthers: number;
      holders: EquipmentHolder[];
    } | null = null;
    let shortageDates = 0;

    for (const date of [...draftWindowsByDate.keys()].sort()) {
      const draftWindows = draftWindowsByDate.get(date)!;
      const claimWindows = claims
        .map((claim) => ({
          claim,
          windows: windowsOf(claim.parentId).get(date) ?? [],
        }))
        .filter(({ windows }) => windows.length > 0);

      const moment = tightestMomentOnDate(
        draftWindows,
        claimWindows,
        requested,
        total,
      );
      if (!moment) continue;
      if (moment.short) shortageDates++;
      // Strictly greater keeps the EARLIEST date among equally tight ones.
      if (!tightest || moment.heldByOthers > tightest.heldByOthers)
        tightest = {
          date,
          start: moment.start,
          end: moment.end,
          heldByOthers: moment.heldByOthers,
          holders: moment.holders,
        };
    }

    const heldByOthers = tightest?.heldByOthers ?? 0;
    const available = total - heldByOthers;
    demands.push({
      equipmentId,
      total,
      requested,
      available,
      heldByOthers,
      missing: requested - available,
      at: tightest
        ? {
            date: tightest.date,
            day: hebrewDayFromIso(tightest.date),
            start: tightest.start,
            end: tightest.end,
          }
        : null,
      holders: tightest?.holders ?? [],
      count: shortageDates,
      recurring: shortageDates > 1,
    });
  }

  return demands;
}
