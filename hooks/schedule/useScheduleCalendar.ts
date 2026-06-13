import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  daysBetweenInclusive,
  fromISODate,
  getMonthGrid,
  startOfMonth,
  startOfWeek,
  toISODate,
} from "@/lib/calendar";
import {
  ALL_CATEGORIES,
  buildEvents,
  buildFacetOptions,
  eventMatchesFacet,
  FACET_KEYS,
  SCHEDULE_FACETS,
  sortEvents,
  type EventCategory,
  type FacetKey,
  type ScheduleEvent,
} from "@/lib/schedule-data";

/** An empty selection for every facet — the default (no facet filtering). */
function emptyFacetState(): Record<FacetKey, Set<string>> {
  return {
    player: new Set(),
    class: new Set(),
    coach: new Set(),
    room: new Set(),
    competition: new Set(),
    event: new Set(),
  };
}

/** A normalized inclusive day range, smallest ISO first. */
export interface DayRange {
  start: string;
  end: string;
}

function normalizeRange(a: string, b: string): DayRange {
  return a <= b ? { start: a, end: b } : { start: b, end: a };
}

/** The Sunday–Saturday week that contains `date`. */
function weekContaining(date: Date): DayRange {
  const start = startOfWeek(date);
  return { start: toISODate(start), end: toISODate(addDays(start, 6)) };
}

export function useScheduleCalendar() {
  // The reference "now" — fixed once per mount so the grid is stable.
  const [today] = useState(() => new Date());

  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(today));

  // Default selection: the current week — shown as columns in the time-grid.
  const [range, setRange] = useState<DayRange>(() => weekContaining(today));

  // Press-and-drag selection. While dragging we derive the live range from the
  // anchor + the day currently under the cursor.
  const [dragAnchor, setDragAnchor] = useState<string | null>(null);
  const [dragHover, setDragHover] = useState<string | null>(null);

  const [hiddenCategories, setHiddenCategories] = useState<Set<EventCategory>>(
    () => new Set(),
  );

  // Per-facet selected values (שחקן / חוג / מדריך / חדר / תחרות / אירוע).
  const [facetFilters, setFacetFilters] =
    useState<Record<FacetKey, Set<string>>>(emptyFacetState);

  const events = useMemo(() => buildEvents(today), [today]);
  const facetOptions = useMemo(() => buildFacetOptions(events), [events]);
  const monthGrid = useMemo(() => getMonthGrid(viewMonth), [viewMonth]);

  // The range to paint: the in-progress drag wins over the committed range.
  const activeRange = useMemo<DayRange>(() => {
    if (dragAnchor && dragHover) return normalizeRange(dragAnchor, dragHover);
    return range;
  }, [dragAnchor, dragHover, range]);

  const isSelected = useCallback(
    (iso: string) => iso >= activeRange.start && iso <= activeRange.end,
    [activeRange],
  );

  // ── Selection (click / drag) ──────────────────────────────────────
  const beginSelection = useCallback((iso: string) => {
    setDragAnchor(iso);
    setDragHover(iso);
  }, []);

  const extendSelection = useCallback(
    (iso: string) => {
      if (dragAnchor) setDragHover(iso);
    },
    [dragAnchor],
  );

  const endSelection = useCallback(() => {
    if (dragAnchor && dragHover) {
      // A plain click selects a single day; a drag selects the exact range.
      setRange(normalizeRange(dragAnchor, dragHover));
    }
    setDragAnchor(null);
    setDragHover(null);
  }, [dragAnchor, dragHover]);

  // A drag can end anywhere (even outside the grid) — listen globally so the
  // selection always commits cleanly.
  useEffect(() => {
    if (!dragAnchor) return;
    window.addEventListener("mouseup", endSelection);
    return () => window.removeEventListener("mouseup", endSelection);
  }, [dragAnchor, endSelection]);

  // ── Month navigation ──────────────────────────────────────────────
  // Swiping months only changes which month the picker shows; the selected
  // range stays put until the user manually picks new dates.
  const goToPrevMonth = useCallback(() => {
    setViewMonth((m) => addMonths(m, -1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth((m) => addMonths(m, 1));
  }, []);

  // Jump back to "now": show the current month and select the current week,
  // regardless of where the user has navigated.
  const goToToday = useCallback(() => {
    setViewMonth(startOfMonth(today));
    setRange(weekContaining(today));
  }, [today]);

  // ── Category filter ───────────────────────────────────────────────
  const toggleCategory = useCallback((category: EventCategory) => {
    setHiddenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  // ── Facet filters ─────────────────────────────────────────────────
  // Add a value to (or remove it from) the current filter for a facet.
  const toggleFacetValue = useCallback((key: FacetKey, value: string) => {
    setFacetFilters((prev) => {
      const nextSet = new Set(prev[key]);
      if (nextSet.has(value)) nextSet.delete(value);
      else nextSet.add(value);
      return { ...prev, [key]: nextSet };
    });
  }, []);

  const clearFacet = useCallback((key: FacetKey) => {
    setFacetFilters((prev) => ({ ...prev, [key]: new Set<string>() }));
  }, []);

  const clearAllFacets = useCallback(() => setFacetFilters(emptyFacetState()), []);

  // "Clear all" from the toolbar resets every filter — both the facet
  // selections and the hidden categories (חוג / תחרות / אירוע / ליגה).
  const clearAllFilters = useCallback(() => {
    setFacetFilters(emptyFacetState());
    setHiddenCategories(new Set());
  }, []);

  // ── Derived event sets ────────────────────────────────────────────
  const visibleEvents = useMemo(
    () =>
      events.filter((e) => {
        if (hiddenCategories.has(e.category)) return false;
        // AND across facets: every active facet must match (OR within it).
        return FACET_KEYS.every((key) =>
          eventMatchesFacet(e, key, facetFilters[key]),
        );
      }),
    [events, hiddenCategories, facetFilters],
  );

  const activeFacetCount = useMemo(
    () => FACET_KEYS.reduce((sum, key) => sum + facetFilters[key].size, 0),
    [facetFilters],
  );

  // Total active filters across facets + hidden categories — drives the
  // "clear all" control so it appears whenever anything is filtered.
  const activeFilterCount = activeFacetCount + hiddenCategories.size;

  // Events grouped per day for fast lookup.
  const eventsByDay = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    for (const e of visibleEvents) {
      const list = map.get(e.date);
      if (list) list.push(e);
      else map.set(e.date, [e]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.start.localeCompare(b.start));
    }
    return map;
  }, [visibleEvents]);

  // Every date inside the selected range — one column of the time-grid, with
  // that day's events attached.
  const selectedDays = useMemo(() => {
    const start = fromISODate(activeRange.start);
    const count = daysBetweenInclusive(activeRange.start, activeRange.end);
    return Array.from({ length: count }, (_, i) => {
      const date = addDays(start, i);
      const iso = toISODate(date);
      return { date, iso, events: eventsByDay.get(iso) ?? [] };
    });
  }, [activeRange, eventsByDay]);

  const totalEvents = useMemo(
    () => selectedDays.reduce((sum, d) => sum + d.events.length, 0),
    [selectedDays],
  );

  // Flat, sorted list of every event in range (handy for counts).
  const eventsInRange = useMemo(
    () =>
      sortEvents(
        visibleEvents.filter(
          (e) => e.date >= activeRange.start && e.date <= activeRange.end,
        ),
      ),
    [visibleEvents, activeRange],
  );

  return {
    today,
    viewMonth,
    monthGrid,
    activeRange,
    isDragging: dragAnchor !== null,
    isSelected,
    beginSelection,
    extendSelection,
    endSelection,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    categories: ALL_CATEGORIES,
    hiddenCategories,
    toggleCategory,
    facets: SCHEDULE_FACETS,
    facetOptions,
    facetFilters,
    toggleFacetValue,
    clearFacet,
    clearAllFacets,
    clearAllFilters,
    activeFacetCount,
    activeFilterCount,
    eventsByDay,
    eventsInRange,
    selectedDays,
    totalEvents,
    rangeLength: daysBetweenInclusive(activeRange.start, activeRange.end),
    rangeStart: fromISODate(activeRange.start),
    rangeEnd: fromISODate(activeRange.end),
  };
}
