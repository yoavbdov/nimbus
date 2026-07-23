import { useMemo, useState } from "react";
import type { Course } from "@/lib/courses-data";

export type SortKey =
  | "name"
  | "coach"
  | "age"
  | "rating"
  | "enrolled"
  | "capacity"
  | "days"
  | "nextDate"
  | "status"
  | "room";
export type SortDir = "asc" | "desc";

const statusOrder: Record<Course["status"], number> = {
  "פעיל": 0,
  "מתוכנן": 1,
  "הסתיים": 2,
  "ללא פעילות": 3,
  "ארכיון": 4,
};

function getSortValue(a: Course, key: SortKey): string | number {
  switch (key) {
    case "name":
      return a.name;
    case "coach":
      return a.coach;
    case "age":
      return a.ageMin;
    case "rating":
      return a.ratingMin;
    case "enrolled":
      return a.enrolled;
    // Unlimited sorts last (ascending) — it is the largest capacity there is.
    case "capacity":
      return a.capacity || Infinity;
    case "days":
      return a.days.length;
    case "nextDate":
      return a.nextDate;
    case "status":
      return statusOrder[a.status];
    case "room":
      return a.room;
  }
}

export function useCoursesSort(courses: Course[]) {
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
    const arr = [...courses];
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
  }, [courses, sortKey, sortDir]);

  return { sortKey, sortDir, sorted, handleSort };
}
