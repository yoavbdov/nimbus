"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CoursesActions } from "@/components/courses/CoursesActions";
import { FilterBar } from "@/components/courses/filters/FilterBar";
import { CoursesTable } from "@/components/courses/CoursesTable";
import { CourseFormModal } from "@/components/courses/CourseFormModal";
import { useCoursesPanel } from "@/hooks/courses/useCoursesPanel";
import { useAddCourse } from "@/hooks/courses/useAddCourse";

export function CoursesPanel() {
  const {
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
    total,
    filterKey,
    filterOptions,
  } = useCoursesPanel();

  const addCourse = useAddCourse();

  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardContent className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
              ניהול חוגים
            </h1>
            <p className="text-xs text-muted-foreground/80 num">
              {filtered.length} מתוך {total} חוגים
            </p>
          </div>
          <CoursesActions onAddCourse={addCourse.openModal} />
        </div>

        <Separator className="bg-foreground/8" />

        <FilterBar
          search={search}
          filters={filters}
          todayOnly={todayOnly}
          onSearchChange={setSearch}
          onAdd={addFilter}
          onUpdate={updateFilter}
          onRemove={removeFilter}
          onToggleToday={toggleToday}
          onClearAll={clearAll}
          options={filterOptions}
        />

        <div className="neu-inset rounded-2xl p-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={filterKey}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <CoursesTable courses={filtered} />
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>

      <CourseFormModal addCourse={addCourse} />
    </Card>
  );
}
