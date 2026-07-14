import { useMemo, useState } from "react";
import type { Course, CourseOccupancy } from "@/lib/courses-data";

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
  | "occupancy"
  | "room";
export type SortDir = "asc" | "desc";

const statusOrder: Record<Course["status"], number> = {
  "פעיל": 0,
  "לא פעיל": 1,
  "ארכיון": 2,
};

const occupancyOrder: Record<CourseOccupancy, number> = {
  "ריק": 0,
  "חלקי": 1,
  "מלא": 2,
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
    case "capacity":
      return a.capacity;
    case "days":
      return a.days.length;
    case "nextDate":
      return a.nextDate;
    case "status":
      return statusOrder[a.status];
    case "occupancy":
      return occupancyOrder[a.occupancy];
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
