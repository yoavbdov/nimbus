import { useMemo, useState } from "react";
import type { Player } from "@/lib/players-data";

/** Sortable columns; "name" sorts alphabetically, the rest numerically. */
export type PeopleSortKey = "name" | "age" | "rating";
export type PeopleSortDir = "asc" | "desc";
export type PeopleSort = { key: PeopleSortKey; dir: PeopleSortDir } | null;

/** Parse a range-filter input; blank / non-numeric → no bound. */
function bound(raw: string): number | null {
  const n = Number(raw);
  return raw.trim() === "" || Number.isNaN(n) ? null : n;
}

/**
 * Owns the view state for the people picker: the name search, the age / rating
 * range filters and the column sort, plus the derived visible list. Kept out of
 * the presentational {@link PeoplePickerDialog} so the component only renders.
 *
 * `open` is the dialog's visibility: the whole view state resets each time the
 * picker opens, so the filter always starts collapsed and empty (the component
 * stays mounted while closed, so it wouldn't reset on its own).
 */
export function usePeoplePicker(people: Player[], open: boolean) {
  const [query, setQuery] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [ratingMin, setRatingMin] = useState("");
  const [ratingMax, setRatingMax] = useState("");
  // No sort selected → keep the roster's original order.
  const [sort, setSort] = useState<PeopleSort>(null);
  // Whether the collapsible filter panel is expanded.
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Start every open from a clean slate: filter off, no ranges, no search/sort.
  // Done during render (React's "reset state when a prop changes" pattern) by
  // tracking the previous `open` — the component stays mounted while closed, so
  // it wouldn't reset on its own.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setSort(null);
      setFiltersOpen(false);
      setAgeMin("");
      setAgeMax("");
      setRatingMin("");
      setRatingMax("");
    }
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const aMin = bound(ageMin);
    const aMax = bound(ageMax);
    const rMin = bound(ratingMin);
    const rMax = bound(ratingMax);

    const filtered = people.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (aMin != null && p.age < aMin) return false;
      if (aMax != null && p.age > aMax) return false;
      if (rMin != null && p.israeliRating < rMin) return false;
      if (rMax != null && p.israeliRating > rMax) return false;
      return true;
    });

    if (!sort) return filtered;
    const factor = sort.dir === "asc" ? 1 : -1;
    // Copy before sorting so we never mutate the incoming array.
    return [...filtered].sort((a, b) => {
      if (sort.key === "name") return a.name.localeCompare(b.name) * factor;
      const av = sort.key === "age" ? a.age : a.israeliRating;
      const bv = sort.key === "age" ? b.age : b.israeliRating;
      return (av - bv) * factor;
    });
  }, [people, query, ageMin, ageMax, ratingMin, ratingMax, sort]);

  // Click a column: first click sorts ascending, next flips, third clears.
  function toggleSort(key: PeopleSortKey) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  return {
    query,
    setQuery,
    ageMin,
    setAgeMin,
    ageMax,
    setAgeMax,
    ratingMin,
    setRatingMin,
    ratingMax,
    setRatingMax,
    sort,
    toggleSort,
    visible,
    filtersOpen,
    toggleFilters: () => setFiltersOpen((o) => !o),
  };
}
