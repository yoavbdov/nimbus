import { useMemo, useState } from "react";
import type { Activity } from "@/lib/activities-data";

export type SortKey =
  | "name"
  | "coach"
  | "age"
  | "fitness"
  | "enrolled"
  | "capacity"
  | "days"
  | "status";
export type SortDir = "asc" | "desc";

const statusOrder: Record<Activity["status"], number> = {
  "פעיל": 0,
  "מלא": 1,
  "לא פעיל": 2,
};

function getSortValue(a: Activity, key: SortKey): string | number {
  switch (key) {
    case "name":
      return a.name;
    case "coach":
      return a.coach;
    case "age":
      return a.ageMin;
    case "fitness":
      return a.fitnessMin;
    case "enrolled":
      return a.enrolled;
    case "capacity":
      return a.capacity;
    case "days":
      return a.days.length;
    case "status":
      return statusOrder[a.status];
  }
}

export function useActivitiesSort(activities: Activity[]) {
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
    const arr = [...activities];
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
  }, [activities, sortKey, sortDir]);

  return { sortKey, sortDir, sorted, handleSort };
}
