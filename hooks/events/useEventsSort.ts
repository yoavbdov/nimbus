import { useMemo, useState } from "react";
import type { ClubEvent } from "@/lib/events-data";

export type SortKey = "name" | "days" | "nextDate" | "status" | "recurrence" | "room";
export type SortDir = "asc" | "desc";

const statusOrder: Record<ClubEvent["status"], number> = {
  "פעיל": 0,
  "מתוכנן": 1,
  "הסתיים": 2,
};

function getSortValue(e: ClubEvent, key: SortKey): string | number {
  switch (key) {
    case "name":
      return e.name;
    case "days":
      return e.days.length;
    case "nextDate":
      return e.nextDate;
    case "status":
      return statusOrder[e.status];
    case "recurrence":
      return e.recurrence;
    case "room":
      return e.room;
  }
}

export function useEventsSort(events: ClubEvent[]) {
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
    const arr = [...events];
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
  }, [events, sortKey, sortDir]);

  return { sortKey, sortDir, sorted, handleSort };
}
