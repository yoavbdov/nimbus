import { useMemo, useState } from "react";
import { filterCourses, type CourseFilter } from "@/lib/courses-filters";
import type { Course } from "@/lib/courses-data";

export function useCoursesFilter(courses: Course[]) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CourseFilter[]>([]);
  const [todayOnly, setTodayOnly] = useState(false);

  function addFilter(filter: CourseFilter) {
    setFilters((prev) => [...prev, filter]);
  }

  function removeFilter(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }

  function updateFilter(id: string, next: CourseFilter) {
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...next, id } : f)));
  }

  function toggleToday() {
    setTodayOnly((v) => !v);
  }

  function clearAll() {
    setFilters([]);
    setSearch("");
    setTodayOnly(false);
  }

  const filtered = useMemo(
    () => filterCourses(courses, search, filters, todayOnly),
    [courses, search, filters, todayOnly],
  );

  return {
    search,
    setSearch,
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    todayOnly,
    toggleToday,
    clearAll,
    filtered,
  };
}
