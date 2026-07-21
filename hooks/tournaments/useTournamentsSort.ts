import { useMemo, useState } from "react";
import type { Tournament } from "@/lib/tournaments-data";

export type SortKey =
  | "name"
  | "status"
  | "judge"
  | "rounds"
  | "days"
  | "nextDate"
  | "participants"
  | "age"
  | "rating"
  | "room";
export type SortDir = "asc" | "desc";

const statusOrder: Record<Tournament["status"], number> = {
  "פעילה": 0,
  "מתוכננת": 1,
  "הסתיימה": 2,
  "ללא פעילות": 3,
  "ארכיון": 4,
};

function getSortValue(t: Tournament, key: SortKey): string | number {
  switch (key) {
    case "name":
      return t.name;
    case "status":
      return statusOrder[t.status];
    case "judge":
      return t.judge;
    case "rounds":
      return t.rounds;
    case "days":
      return t.days.length;
    case "nextDate":
      return t.nextDate;
    case "participants":
      return t.participants;
    case "age":
      return t.ageMin ?? 0;
    case "rating":
      return t.ratingMin;
    case "room":
      return t.room;
  }
}

export function useTournamentsSort(tournaments: Tournament[]) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    const arr = [...tournaments];
    arr.sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), "he");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [tournaments, sortKey, sortDir]);

  return { sortKey, sortDir, sorted, handleSort };
}
